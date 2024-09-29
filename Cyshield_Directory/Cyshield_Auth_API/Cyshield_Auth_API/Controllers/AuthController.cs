using Cyshield_Auth_API.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Configuration;
using System.Data.SqlClient;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Security.Cryptography;
using System.Text;

[Route("api/[controller]")]
[ApiController]
public class AuthController : ControllerBase
{
    private readonly IConfiguration _configuration;
    private readonly string _jwtSecretKey;

    public AuthController(IConfiguration configuration)
    {
        _configuration = configuration;
        _jwtSecretKey = configuration["Jwt:Key"];
    }

    [HttpPost("register")]
    public IActionResult Register([FromBody] User user)
    {
        using (SqlConnection conn = new SqlConnection(_configuration.GetConnectionString("DefaultConnection")))
        {
            conn.Open();

            // Check if the email already exists
            string checkEmailQuery = "SELECT COUNT(*) FROM Users WHERE Email = @Email";
            SqlCommand checkEmailCmd = new SqlCommand(checkEmailQuery, conn);
            checkEmailCmd.Parameters.AddWithValue("@Email", user.Email);
            int emailCount = (int)checkEmailCmd.ExecuteScalar();

            if (emailCount > 0)
            {
                return Conflict(new { message = "Email already exists" });
            }

            // Check if the username already exists
            string checkUsernameQuery = "SELECT COUNT(*) FROM Users WHERE Username = @Username";
            SqlCommand checkUsernameCmd = new SqlCommand(checkEmailQuery, conn);
            checkUsernameCmd.Parameters.AddWithValue("@Username", user.Username);
            int usernameCount = (int)checkEmailCmd.ExecuteScalar();

            if (usernameCount > 0)
            {
                return Conflict(new { message = "Username already exists" });
            }

            // Proceed with user registration
            var hashedPassword = HashPassword(user.Password);
            string insertQuery = "INSERT INTO Users (Username, Email, Password, Role) VALUES (@Username, @Email, @Password, @Role)";
            SqlCommand insertCmd = new SqlCommand(insertQuery, conn);
            insertCmd.Parameters.AddWithValue("@Username", user.Username);
            insertCmd.Parameters.AddWithValue("@Email", user.Email);
            insertCmd.Parameters.AddWithValue("@Password", hashedPassword);
            insertCmd.Parameters.AddWithValue("@Role", "Default");
            insertCmd.ExecuteNonQuery();
        }

        return Ok(new { message = "User registered successfully" });
    }

    [HttpPost("login")]
    public IActionResult Login([FromBody] User user)
    {
        using (SqlConnection conn = new SqlConnection(_configuration.GetConnectionString("DefaultConnection")))
        {
            conn.Open();
            string query = "SELECT * FROM Users WHERE Email = @Email";
            SqlCommand cmd = new SqlCommand(query, conn);
            cmd.Parameters.AddWithValue("@Email", user.Email);
            SqlDataReader reader = cmd.ExecuteReader();

            if (reader.Read())
            {
                var storedPassword = reader.GetString(reader.GetOrdinal("Password"));
                if (VerifyPassword(user.Password, storedPassword))
                {
                    var email = reader.GetString(reader.GetOrdinal("Email"));
                    var role = reader.GetString(reader.GetOrdinal("Role"));
                    var username = reader.GetString(reader.GetOrdinal("Username"));

                    var token = GenerateJwtToken(email, role, username);
                    return Ok(new { message = "Login successful", token = token });
                }
            }
        }

        return Unauthorized(new { message = "Invalid credentials" });
    }

    [HttpPost("verify-token")]
    public IActionResult VerifyToken([FromBody] TokenRequest tokenRequest)
    {
        var principal = VerifyJwtToken(tokenRequest.Token);

        if (principal != null)
        {
            var email = principal.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            var role = principal.FindFirst(ClaimTypes.Role)?.Value;
            var username = principal.FindFirst(ClaimTypes.Name)?.Value;

            return Ok(new
            {
                message = "Token is valid",
                email = email,
                role = role,
                username = username
            });
        }

        return Unauthorized(new { message = "Invalid token" });
    }

    private string GenerateJwtToken(string email, string role, string username)
    {
        var claims = new[]
        {
            new Claim(JwtRegisteredClaimNames.Sub, email),
            new Claim(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString()),
            new Claim(ClaimTypes.Role, role),
            new Claim(ClaimTypes.Name, username)
        };

        var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_configuration["Jwt:Key"]));
        var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

        var token = new JwtSecurityToken(
            issuer: _configuration["Jwt:Issuer"],
            audience: _configuration["Jwt:Audience"],
            claims: claims,
            expires: DateTime.Now.AddMinutes(Convert.ToDouble(_configuration["Jwt:ExpireMinutes"])),
            signingCredentials: creds
        );

        return new JwtSecurityTokenHandler().WriteToken(token);
    }

    private ClaimsPrincipal VerifyJwtToken(string token)
    {
        var tokenHandler = new JwtSecurityTokenHandler();
        var key = Encoding.ASCII.GetBytes(_jwtSecretKey);

        try
        {
            var validationParameters = new TokenValidationParameters
            {
                ValidateIssuerSigningKey = true,
                IssuerSigningKey = new SymmetricSecurityKey(key),
                ValidateIssuer = true,
                ValidIssuer = _configuration["Jwt:Issuer"],
                ValidateAudience = true,
                ValidAudience = _configuration["Jwt:Audience"],
                ClockSkew = TimeSpan.Zero
            };

            SecurityToken validatedToken;
            var principal = tokenHandler.ValidateToken(token, validationParameters, out validatedToken);

            if (validatedToken is JwtSecurityToken jwtToken && jwtToken.Header.Alg.Equals(SecurityAlgorithms.HmacSha256, StringComparison.InvariantCultureIgnoreCase))
            {
                return principal;
            }
        }
        catch (Exception ex)
        {
            // Log the exception or handle it as needed
            Console.WriteLine($"Token validation failed: {ex.Message}");
        }

        return null;
    }

    private string HashPassword(string password)
    {
        using (SHA256 sha256 = SHA256.Create())
        {
            byte[] hashedBytes = sha256.ComputeHash(Encoding.UTF8.GetBytes(password));
            return BitConverter.ToString(hashedBytes).Replace("-", "").ToLower();
        }
    }

    private bool VerifyPassword(string enteredPassword, string storedHashedPassword)
    {
        return HashPassword(enteredPassword) == storedHashedPassword;
    }
}

public class TokenRequest
{
    public string Token { get; set; }
}