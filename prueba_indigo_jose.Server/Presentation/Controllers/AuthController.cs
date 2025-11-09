using BCrypt.Net;
using Microsoft.AspNetCore.Mvc;
using prueba_indigo_jose.Server.Application.Services;
using prueba_indigo_jose.Server.Core.DTO;
using prueba_indigo_jose.Server.Core.Entities;
using prueba_indigo_jose.Server.Core.Interfaces;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;

namespace prueba_indigo_jose.Server.Presentation.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AuthController : ControllerBase
    {
        private readonly IUserRepository _userRepository;
        private readonly AuthService _authService;

        public AuthController(IUserRepository userRepository, AuthService authService)
        {
            _userRepository = userRepository;
            _authService = authService;
        }

        [AllowAnonymous]
        [HttpPost("register")]
        public async Task<IActionResult> Register(User user)
        {
            user.Password = BCrypt.Net.BCrypt.HashPassword(user.Password);
            await _userRepository.AddAsync(user);
            await _userRepository.SaveChangesAsync();
            return Ok("User registered successfully");
        }

        [AllowAnonymous]
        [HttpPost("login")]
        public async Task<IActionResult> Login([FromBody] LoginDTO login)
        {
            var users = await _userRepository.GetAllAsync();
            var user = users.FirstOrDefault(u => u.Username == login.Username);

            if (user == null || !BCrypt.Net.BCrypt.Verify(login.Password, user.Password))
                return Unauthorized("Invalid credentials");

            var token = _authService.GenerateJwtToken(user);
            var refreshToken = _authService.GenerateRefreshToken();
            _authService.SaveRefreshToken(user.Username, refreshToken);

            return Ok(new AuthResponseDTO
            {
                Token = token,
                RefreshToken = refreshToken,
                Username = user.Username,
                Email = user.Email
            });
        }

        [AllowAnonymous]
        [HttpPost("refresh")]
        public async Task<IActionResult> Refresh([FromBody] RefreshTokenRequestDTO request)
        {
            var users = await _userRepository.GetAllAsync();
            var user = users.FirstOrDefault(u =>
                _authService.ValidateRefreshToken(u.Username, request.RefreshToken));

            if (user == null)
                return Unauthorized("Invalid refresh token");

            var newToken = _authService.GenerateJwtToken(user);
            var newRefresh = _authService.GenerateRefreshToken();
            _authService.SaveRefreshToken(user.Username, newRefresh);

            return Ok(new AuthResponseDTO
            {
                Token = newToken,
                RefreshToken = newRefresh,
                Username = user.Username,
                Email = user.Email
            });
        }
    }
}
