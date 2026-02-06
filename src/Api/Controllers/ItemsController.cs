using Application.DTOs;
using Application.Interfaces;
using Application.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace Api.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class ItemsController : ControllerBase
    {
        private readonly IGenericRepository<Item> _repository;

        public ItemsController(IGenericRepository<Item> repository)
        {
            _repository = repository;
        }

        // GET: api/Items
        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            var items = await _repository.GetAllAsync();

            var response = items.Select(item => new ItemResponse
            {
                Id = item.Id, // Questo ora è un GUID
                Name = item.Name,
                Description = item.Description,
                Quantity = item.Quantity,
                UserId = item.UserId 
            });

            return Ok(response);
        }

        // POST: api/Items
       [HttpPost]
        public async Task<IActionResult> Create(CreateItemRequest request)
        {
            var userIdString = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            
            if (!Guid.TryParse(userIdString, out Guid userId))
            {
                return Unauthorized("Impossibile identificare l'utente.");
            }

            var newItem = new Item
            {
                Id = Guid.NewGuid(),
                Name = request.Name,
                Description = request.Description,
                Quantity = request.Quantity,
                UserId = userId,
                
                // --- AGGIUNGI QUESTO! ---
                CreatedAt = DateTime.UtcNow, 
                UpdatedAt = DateTime.UtcNow // Valorizziamo anche questo per non avere null
            };

            await _repository.AddAsync(newItem);

            return Ok(new { message = "Item creato e assegnato al tuo utente!", id = newItem.Id });
        }

        // GET: api/Items/{guid}
        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(Guid id) // MODIFICA: id è Guid
        {
            var item = await _repository.GetByIdAsync(id);
            if (item == null) return NotFound();

            var response = new ItemResponse
            {
                Id = item.Id,
                Name = item.Name,
                Description = item.Description,
                Quantity = item.Quantity,
                UserId = item.UserId
            };

            return Ok(response);
        }

        // DELETE: api/Items/{guid}
        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(Guid id) // MODIFICA: id è Guid
        {
            await _repository.DeleteAsync(id);
            return Ok(new { message = "Oggetto eliminato con successo" });
        }

        // PUT: api/Items
        [HttpPut]
        public async Task<IActionResult> Update(Item item)
        {
            // Nota: item.Id sarà già un Guid perché il modello è aggiornato
            await _repository.UpdateAsync(item);
            return Ok(new { message = "Oggetto aggiornato con successo" });
        }
    }
}