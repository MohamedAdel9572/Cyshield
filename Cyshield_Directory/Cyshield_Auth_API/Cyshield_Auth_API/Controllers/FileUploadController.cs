using Cyshield_Auth_API.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Configuration;
using System.Data.SqlClient;
using System.IdentityModel.Tokens.Jwt;
using System.Linq;
using System.Text;
using Microsoft.IdentityModel.Tokens;
using System.Collections.Generic;
using System.IO;
using System.Threading.Tasks;
using System.Data;
using System.Security.Claims;
using System.Net;
using System.Numerics;

namespace Cyshield_Auth_API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class FileUploadController : ControllerBase
    {
        private readonly string _connectionString;
        private readonly string _jwtSecretKey;

        public FileUploadController(IConfiguration configuration)
        {
            _connectionString = configuration.GetConnectionString("DefaultConnection");
            _jwtSecretKey = configuration["Jwt:Key"];
        }



        [HttpPost("upload/{username}")]
        public async Task<IActionResult> UploadFile(string username, IFormFile file)
        {
            if (file == null || file.Length == 0)
                return BadRequest("File is not selected");

            try
            {
                // Get user ID from the username
                var createdByUserId = await GetUserIdFromUsername(username);
                if (createdByUserId == -1)
                    return BadRequest("User not found");

                using (var reader = new StreamReader(file.OpenReadStream()))
                {
                    string line;
                    int? lastInsertedSubnetId = null; // Hold the last inserted SubnetId

                    while ((line = await reader.ReadLineAsync()) != null)
                    {
                        var parts = line.Split('/');
                        if (parts.Length == 2)
                        {
                            // It's a subnet
                            string subnetAddress = parts[0];
                            string subnetMask = parts[1];

                            // Insert into Subnets table and get the SubnetId
                            try
                            {
                                using (var connection = new SqlConnection(_connectionString))
                                {
                                    await connection.OpenAsync();
                                    var command = new SqlCommand(
                                        @"INSERT INTO Subnets (SubnetAddress, SubnetName, CreatedBy) 
                                  VALUES (@SubnetAddress, @SubnetName, @CreatedBy);
                                  SELECT SCOPE_IDENTITY();", connection);

                                    command.Parameters.AddWithValue("@SubnetName", "NO NAME GIVEN");
                                    command.Parameters.AddWithValue("@SubnetAddress", $"{subnetAddress}/{subnetMask}");
                                    command.Parameters.AddWithValue("@CreatedBy", createdByUserId);

                                    lastInsertedSubnetId = Convert.ToInt32(await command.ExecuteScalarAsync());
                                }
                            }
                            catch (Exception ex)
                            {
                                return StatusCode(500, $"Error inserting subnet: {ex.Message}");
                            }

                            // Convert subnet to individual IPs and insert them into IPs table
                            try
                            {
                                var ips = SubnetUtils.GetAllIPsInRange(subnetAddress, subnetMask); // Generate IPs from subnet

                                using (var connection = new SqlConnection(_connectionString))
                                {
                                    await connection.OpenAsync();

                                    foreach (var ip in ips)
                                    {
                                        var command = new SqlCommand(
                                            @"INSERT INTO IPs (IpAddress, SubnetId, CreatedBy) 
                                      VALUES (@IpAddress, @SubnetId, @CreatedBy)", connection);

                                        command.Parameters.AddWithValue("@IpAddress", ip);
                                        command.Parameters.AddWithValue("@SubnetId", lastInsertedSubnetId); // Use last inserted SubnetId
                                        command.Parameters.AddWithValue("@CreatedBy", createdByUserId);

                                        await command.ExecuteNonQueryAsync();
                                    }
                                }
                            }
                            catch (Exception ex)
                            {
                                return StatusCode(500, $"Error inserting IPs: {ex.Message}");
                            }
                        }
                        else if (parts.Length == 1)
                        {
                            // It's a single IP address (not associated with subnet)
                            string ipAddress = parts[0];

                            try
                            {
                                using (var connection = new SqlConnection(_connectionString))
                                {
                                    await connection.OpenAsync();
                                    var command = new SqlCommand(
                                        @"INSERT INTO IPs (IpAddress, SubnetId, CreatedBy) 
                                  VALUES (@IpAddress, @SubnetId, @CreatedBy)", connection);

                                    command.Parameters.AddWithValue("@IpAddress", ipAddress);
                                    command.Parameters.AddWithValue("@SubnetId", lastInsertedSubnetId); // Use last inserted SubnetId
                                    command.Parameters.AddWithValue("@CreatedBy", createdByUserId);

                                    await command.ExecuteNonQueryAsync();
                                }
                            }
                            catch (Exception ex)
                            {
                                return StatusCode(500, $"Error inserting IP: {ex.Message}");
                            }
                        }
                    }
                }

                return Ok("File uploaded and data stored successfully");
            }
            catch (SecurityTokenValidationException ex)
            {
                return Unauthorized(ex.Message);
            }
            catch (Exception ex)
            {
                return BadRequest($"Token validation failed: {ex.Message}");
            }


        }

        private async Task<int> GetUserIdFromUsername(string username)
        {
            using (var connection = new SqlConnection(_connectionString))
            {
                await connection.OpenAsync();
                var command = new SqlCommand("SELECT Id FROM Users WHERE Username = @Username", connection);
                command.Parameters.AddWithValue("@Username", username);
                var result = await command.ExecuteScalarAsync();
                return result != null ? Convert.ToInt32(result) : -1; // Handle user not found case
            }
        }

        private async Task<int> GetSubnetFromSubnetID(string subnetId)
        {
            using (var connection = new SqlConnection(_connectionString))
            {
                await connection.OpenAsync();
                var command = new SqlCommand("SELECT * FROM Subnets WHERE SubnetId = @SubnetId", connection);
                command.Parameters.AddWithValue("@SubnetId", subnetId);
                var result = await command.ExecuteScalarAsync();
                return result != null ? Convert.ToInt32(result) : -1; // Handle user not found case
            }
        }



        [HttpGet("subnets")]
        public async Task<IActionResult> GetSubnets()
        {
            var subnets = new List<Subnet>();
            try
            {

                using (var connection = new SqlConnection(_connectionString))
                {
                    await connection.OpenAsync();

                    var command = new SqlCommand("SELECT SubnetId, SubnetName, SubnetAddress, CreatedBy, CreatedAt FROM Subnets", connection);

                    using (var reader = await command.ExecuteReaderAsync())
                    {
                        while (await reader.ReadAsync())
                        {
                            subnets.Add(new Subnet
                            {
                                SubnetId = reader.GetInt32("SubnetId"),
                                SubnetName = reader.GetString("SubnetName"),
                                SubnetAddress = reader.GetString("SubnetAddress"),
                                CreatedBy = reader.GetInt32("CreatedBy"),
                                CreatedAt = reader.GetDateTime("CreatedAt")
                            });
                        }
                    }
                }

                return Ok(subnets);
            }
            catch (SecurityTokenValidationException ex)
            {
                return Unauthorized(ex.Message);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }


        [HttpGet("subnets/{username}")]
        public async Task<IActionResult> GetSubnets(string username)
        {
            var subnets = new List<Subnet>();
            try
            {
                using (var connection = new SqlConnection(_connectionString))
                {
                    await connection.OpenAsync();
                    var createdByUserId = await GetUserIdFromUsername(username);
                    // Use a parameterized query and set the parameter value
                    var command = new SqlCommand("SELECT SubnetId, SubnetName, SubnetAddress, CreatedBy, CreatedAt FROM Subnets WHERE CreatedBy = @CreatedByUserId", connection);
                    command.Parameters.AddWithValue("@CreatedByUserId", createdByUserId);  // Bind the username parameter

                    using (var reader = await command.ExecuteReaderAsync())
                    {
                        while (await reader.ReadAsync())
                        {
                            subnets.Add(new Subnet
                            {
                                SubnetId = reader.GetInt32(reader.GetOrdinal("SubnetId")),
                                SubnetName = reader.GetString(reader.GetOrdinal("SubnetName")),
                                SubnetAddress = reader.GetString(reader.GetOrdinal("SubnetAddress")),
                                CreatedBy = reader.GetInt32(reader.GetOrdinal("CreatedBy")),
                                CreatedAt = reader.GetDateTime(reader.GetOrdinal("CreatedAt"))
                            });
                        }
                    }
                }

                return Ok(subnets);
            }
            catch (SecurityTokenValidationException ex)
            {
                return Unauthorized(ex.Message);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        [HttpGet("subnet/{subnetId}")]
        public async Task<IActionResult> GetSubnet(string subnetId)
        {
            var subnets = new List<Subnet>();
            try
            {
                using (var connection = new SqlConnection(_connectionString))
                {
                    await connection.OpenAsync();
                    // Use a parameterized query and set the parameter value
                    var command = new SqlCommand("SELECT SubnetId, SubnetName, SubnetAddress, CreatedBy, CreatedAt FROM Subnets WHERE subnetId = @subnetId", connection);
                    command.Parameters.AddWithValue("@subnetId", subnetId);  // Bind the username parameter

                    using (var reader = await command.ExecuteReaderAsync())
                    {
                        while (await reader.ReadAsync())
                        {
                            subnets.Add(new Subnet
                            {
                                SubnetId = reader.GetInt32(reader.GetOrdinal("SubnetId")),
                                SubnetName = reader.GetString(reader.GetOrdinal("SubnetName")),
                                SubnetAddress = reader.GetString(reader.GetOrdinal("SubnetAddress")),
                                CreatedBy = reader.GetInt32(reader.GetOrdinal("CreatedBy")),
                                CreatedAt = reader.GetDateTime(reader.GetOrdinal("CreatedAt"))
                            });
                        }
                    }
                }

                return Ok(subnets);
            }
            catch (SecurityTokenValidationException ex)
            {
                return Unauthorized(ex.Message);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        [HttpPut("subnets_update")]
        public async Task<IActionResult> UpdateSubnet([FromBody] Subnet subnet)
        {
            try
            {
                using (var connection = new SqlConnection(_connectionString))
                {
                    await connection.OpenAsync();

                    var command = new SqlCommand(
                        @"UPDATE Subnets 
                          SET SubnetName = @SubnetName, 
                              SubnetAddress = @SubnetAddress, 
                              CreatedBy = @CreatedBy, 
                              CreatedAt = @CreatedAt 
                          WHERE SubnetId = @SubnetId", connection);

                    command.Parameters.AddWithValue("@SubnetId", subnet.SubnetId);
                    command.Parameters.AddWithValue("@SubnetName", subnet.SubnetName);
                    command.Parameters.AddWithValue("@SubnetAddress", subnet.SubnetAddress);
                    command.Parameters.AddWithValue("@CreatedBy", subnet.CreatedBy);
                    command.Parameters.AddWithValue("@CreatedAt", subnet.CreatedAt);

                    var result = await command.ExecuteNonQueryAsync();

                    if (result > 0)
                    {
                        return Ok("Subnet updated successfully");
                    }
                    else
                    {
                        return NotFound("Subnet not found");
                    }
                }
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }


        [HttpDelete("subnet_delete/{subnetId}")]
        public async Task<IActionResult> DeleteSubnet(int subnetId)
        {
            try
            {
                using (var connection = new SqlConnection(_connectionString))
                {
                    await connection.OpenAsync();

                    // Begin a transaction to ensure both deletions happen atomically
                    using (var transaction = connection.BeginTransaction())
                    {
                        try
                        {
                            // Delete from IPs table where SubnetId matches
                            var deleteIPsCommand = new SqlCommand("DELETE FROM IPs WHERE SubnetId = @SubnetId", connection, transaction);
                            deleteIPsCommand.Parameters.AddWithValue("@SubnetId", subnetId);
                            await deleteIPsCommand.ExecuteNonQueryAsync();

                            // Delete from Subnets table where SubnetId matches
                            var deleteSubnetCommand = new SqlCommand("DELETE FROM Subnets WHERE SubnetId = @SubnetId", connection, transaction);
                            deleteSubnetCommand.Parameters.AddWithValue("@SubnetId", subnetId);
                            var result = await deleteSubnetCommand.ExecuteNonQueryAsync();

                            if (result > 0)
                            {
                                // Commit the transaction if both delete operations were successful
                                transaction.Commit();
                                return NoContent(); // 204 No Content
                            }
                            else
                            {
                                // Rollback the transaction if the subnet doesn't exist
                                transaction.Rollback();
                                return NotFound(); // 404 Not Found if subnet doesn't exist
                            }
                        }
                        catch (Exception ex)
                        {
                            // Rollback the transaction in case of an error
                            transaction.Rollback();
                            return StatusCode(500, $"Internal server error: {ex.Message}");
                        }
                    }
                }
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }



        [HttpGet("ips/{username}")]
        public async Task<IActionResult> GetIPs(string username)
        {
            var ips = new List<IP>();

            try
            {
                using (var connection = new SqlConnection(_connectionString))
                {
                    await connection.OpenAsync();
                    var createdByUserId = await GetUserIdFromUsername(username);

                    var command = new SqlCommand("SELECT IpId, IpAddress, SubnetId, CreatedBy, CreatedAt FROM IPs WHERE CreatedBy = @CreatedBy", connection);
                    
                    command.Parameters.AddWithValue("@CreatedBy", createdByUserId);  // Bind the username parameter

                    using (var reader = await command.ExecuteReaderAsync())
                    {
                        while (await reader.ReadAsync())
                        {
                            ips.Add(new IP
                            {
                                IpId = reader.GetInt32("IpId"),
                                IpAddress = reader.GetString("IpAddress"),
                                SubnetId = reader.GetInt32("SubnetId"),
                                CreatedBy = reader.GetInt32("CreatedBy"),
                                CreatedAt = reader.GetDateTime("CreatedAt")
                            });
                        }
                    }
                }

                return Ok(ips);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        

        [HttpGet("ip/{ipId}")]
        public async Task<IActionResult> GetIp(string ipId)
        {
            var ips = new List<IP>();
            try
            {
                using (var connection = new SqlConnection(_connectionString))
                {
                    await connection.OpenAsync();
                    // Use a parameterized query and set the parameter value
                    var command = new SqlCommand("SELECT IpId, IpAddress, SubnetId, CreatedBy, CreatedAt FROM IPs WHERE IpId = @IpId", connection);
                    command.Parameters.AddWithValue("@IpId", ipId);  // Bind the ipId parameter

                    using (var reader = await command.ExecuteReaderAsync())
                    {
                        while (await reader.ReadAsync())
                        {
                            ips.Add(new IP
                            {
                                IpId = reader.GetInt32(reader.GetOrdinal("IpId")),
                                IpAddress = reader.GetString(reader.GetOrdinal("IpAddress")),
                                SubnetId = reader.GetInt32(reader.GetOrdinal("SubnetId")), 
                                CreatedBy = reader.GetInt32(reader.GetOrdinal("CreatedBy")),
                                CreatedAt = reader.GetDateTime(reader.GetOrdinal("CreatedAt"))
                            });
                        }
                    }
                }

                return Ok(ips);
            }
            catch (SecurityTokenValidationException ex)
            {
                return Unauthorized(ex.Message);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        [HttpPut("ip_update")]
        public async Task<IActionResult> UpdateIp([FromBody] IP ip)
        {
            if (ip == null)
            {
                return BadRequest("Invalid IP data");
            }

            // Validate the model
            if (!TryValidateModel(ip))
            {
                return BadRequest(ModelState);
            }

            try
            {
                using (var connection = new SqlConnection(_connectionString))
                {
                    await connection.OpenAsync();

                    var command = new SqlCommand(
                        @"UPDATE IPs 
                  SET IpAddress = @IpAddress, 
                      SubnetId = @SubnetId, 
                      CreatedBy = @CreatedBy, 
                      CreatedAt = @CreatedAt 
                  WHERE IpId = @IpId", connection);

                    command.Parameters.AddWithValue("@IpId", ip.IpId);
                    command.Parameters.AddWithValue("@IpAddress", ip.IpAddress);
                    command.Parameters.AddWithValue("@SubnetId", ip.SubnetId);
                    command.Parameters.AddWithValue("@CreatedBy", ip.CreatedBy);
                    command.Parameters.AddWithValue("@CreatedAt", ip.CreatedAt);

                    var result = await command.ExecuteNonQueryAsync();

                    if (result > 0)
                    {
                        return Ok(new { message = "IP updated successfully", ipId = ip.IpId });
                    }
                    else
                    {
                        return NotFound("IP not found");
                    }
                }
            }
            catch (Exception ex)
            {
                // Log the exception details for debugging
                // Example: _logger.LogError(ex, "Error updating IP");
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        [HttpDelete("ip_delete/{ip}")]
        public async Task<IActionResult> DeleteIp(int ip)
        {
            try
            {
                using (var connection = new SqlConnection(_connectionString))
                {
                    await connection.OpenAsync();

                    // Begin a transaction to ensure both deletions happen atomically
                    using (var transaction = connection.BeginTransaction())
                    {
                        try
                        {
                            // Delete from IPs table where IpId matches
                            var deleteIPsCommand = new SqlCommand("DELETE FROM IPs WHERE IpId = @IpId", connection, transaction);
                            deleteIPsCommand.Parameters.AddWithValue("@IpId", ip);

                            var result = await deleteIPsCommand.ExecuteNonQueryAsync();

                            if (result > 0)
                            {
                                // Commit the transaction if the delete operation was successful
                                transaction.Commit();
                                return NoContent(); // 204 No Content
                            }
                            else
                            {
                                // Rollback the transaction if the IP doesn't exist
                                transaction.Rollback();
                                return NotFound(); // 404 Not Found if IP doesn't exist
                            }
                        }
                        catch (Exception ex)
                        {
                            // Rollback the transaction in case of an error
                            transaction.Rollback();
                            return StatusCode(500, $"Internal server error: {ex.Message}");
                        }
                    }
                }
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }
    }
}