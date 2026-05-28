using Microsoft.AspNetCore.Mvc;
using StudyBuddyHub.Api.DTOs;
using StudyBuddyHub.Core.Interfaces;
using System.Linq;
using System.Threading.Tasks;

namespace StudyBuddyHub.Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class SubjectsController : ControllerBase
    {
        private readonly ISubjectRepository _subjectRepository;

        public SubjectsController(ISubjectRepository subjectRepository)
        {
            _subjectRepository = subjectRepository;
        }

        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            var subjects = await _subjectRepository.GetAllAsync();
            var dtos = subjects.Select(s => new SubjectDto
            {
                Id = s.Id,
                Name = s.Name,
                Description = s.Description,
                ImageUrl = s.ImageUrl,
                ImageUrl2 = s.ImageUrl2
            });
            return Ok(dtos);
        }
    }
}
