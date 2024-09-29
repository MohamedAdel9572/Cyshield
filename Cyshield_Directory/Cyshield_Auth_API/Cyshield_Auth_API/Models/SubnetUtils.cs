using System.Net;
using System.Numerics;

namespace Cyshield_Auth_API.Models
{
    public class SubnetUtils
    {
        public static List<string> GetAllIPsInRange(string subnetAddress, string subnetMask)
        {
            var ips = new List<string>();

            // Parse subnetAddress and subnetMask into IPAddress objects
            var networkAddress = IPAddress.Parse(subnetAddress);
            int prefixLength = int.Parse(subnetMask); // Assuming subnetMask is in CIDR format (e.g., "24" for 255.255.255.0)

            // Calculate the number of addresses in the subnet
            BigInteger numberOfHosts = BigInteger.Pow(2, (32 - prefixLength)) - 2; // Minus 2 to exclude network and broadcast addresses for IPv4

            // Convert the IP address to a numeric value
            BigInteger networkAddressValue = IPToBigInteger(networkAddress);

            // Iterate through the possible addresses in the subnet
            for (BigInteger i = 1; i <= numberOfHosts; i++)
            {
                var ipAddress = BigIntegerToIP(networkAddressValue + i);
                ips.Add(ipAddress.ToString());
            }

            return ips;
        }

        private static BigInteger IPToBigInteger(IPAddress ipAddress)
        {
            byte[] addressBytes = ipAddress.GetAddressBytes();
            Array.Reverse(addressBytes); // Convert little-endian to big-endian
            return new BigInteger(addressBytes);
        }

        private static IPAddress BigIntegerToIP(BigInteger ipAddressValue)
        {
            byte[] bytes = ipAddressValue.ToByteArray();
            Array.Resize(ref bytes, 4); // IPv4 addresses are 4 bytes
            Array.Reverse(bytes); // Convert big-endian back to little-endian
            return new IPAddress(bytes);
        }
    }
}
