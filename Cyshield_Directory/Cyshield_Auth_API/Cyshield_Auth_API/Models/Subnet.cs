namespace Cyshield_Auth_API.Models
{
    public class Subnet
    {
        public int SubnetId { get; set; }
        public string SubnetName { get; set; }
        public string SubnetAddress { get; set; }
        public int CreatedBy { get; set; }
        public DateTime CreatedAt { get; set; }
    }
}
