using Microsoft.Extensions.Configuration;
using Microsoft.IdentityModel.Tokens;
using prueba_indigo_jose.Server.Core.Entities;
using System;
using System.Collections.Generic;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Security.Cryptography;
using System.Text;

namespace prueba_indigo_jose.Server.Application.Services
{
    public class AuthService
    {
        private readonly IConfiguration _config;
        private static readonly Dictionary<string, string> RefreshTokens = new();

        public AuthService(IConfiguration config)
        {
            _config = config;
        }

        public string GenerateJwtToken(User user)
        {
            var claims = new[]
            {
                new Claim(JwtRegisteredClaimNames.Sub, user.Username),
                new Claim(JwtRegisteredClaimNames.Email, user.Email),
                new Claim("UserId", user.Id.ToString())
            };

            var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_config["Jwt:Key"]!));
            var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

            var token = new JwtSecurityToken(
                issuer: _config["Jwt:Issuer"],
                audience: _config["Jwt:Audience"],
                claims: claims,
                expires: DateTime.UtcNow.AddMinutes(15),
                signingCredentials: creds
            );

            return new JwtSecurityTokenHandler().WriteToken(token);
        }

        public string GenerateRefreshToken()
        {
            var randomNumber = new byte[64];
            using var rng = RandomNumberGenerator.Create();
            rng.GetBytes(randomNumber);
            return Convert.ToBase64String(randomNumber);
        }

        public void SaveRefreshToken(string username, string refreshToken)
        {
            RefreshTokens[username] = refreshToken;
        }

        public bool ValidateRefreshToken(string username, string refreshToken)
        {
            return RefreshTokens.TryGetValue(username, out var storedToken) && storedToken == refreshToken;
        }
    }
}
