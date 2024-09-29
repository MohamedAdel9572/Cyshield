using System.ComponentModel.DataAnnotations;

namespace Cyshield_Auth_API.Models
{
    public class IP
    {
        [Required(ErrorMessage = "The IpId field is required.")]
        public int IpId { get; set; }

        [Required(ErrorMessage = "The IpAddress field is required.")]
        public string IpAddress { get; set; }

        [Required(ErrorMessage = "The SubnetId field is required.")]
        public int SubnetId { get; set; }

        [Required(ErrorMessage = "The CreatedBy field is required.")]
        public int CreatedBy { get; set; }

        [Required(ErrorMessage = "The CreatedAt field is required.")]
        public DateTime CreatedAt { get; set; }


    }
}
