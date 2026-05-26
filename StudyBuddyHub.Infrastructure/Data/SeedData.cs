using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using StudyBuddyHub.Core.Entities;
using StudyBuddyHub.Infrastructure.Data;
using System.Linq;
using System.Threading.Tasks;

namespace StudyBuddyHub.Infrastructure.Data
{
    public static class SeedData
    {
        // Map from old English names → new Romanian names + descriptions
        private static readonly (string OldName, string NewName, string NewDesc)[] SubjectMigrations =
        [
            ("Mathematics",     "Matematică",       "Calcul, Algebră, Geometrie"),
            ("Computer Science","Informatică",       "Programare, Algoritmi, Structuri de date"),
            ("Physics",         "Fizică",            "Mecanică, Termodinamică, Fizică cuantică"),
            ("Chemistry",       "Chimie",            "Chimie organică, anorganică, analitică"),
            ("Biology",         "Biologie",          "Genetică, Microbiologie, Anatomie"),
            ("History",         "Istorie",           "Istorie mondială, Istorie europeană"),
            ("Languages",       "Limbi Străine",     "Engleză, Franceză, Germană, Spaniolă"),
            ("Business",        "Economie",          "Macroeconomie, Management, Marketing"),
        ];

        private static readonly (string Name, string Desc)[] RomanianSubjects =
        [
            ("Matematică",    "Calcul, Algebră, Geometrie"),
            ("Informatică",   "Programare, Algoritmi, Structuri de date"),
            ("Fizică",        "Mecanică, Termodinamică, Fizică cuantică"),
            ("Chimie",        "Chimie organică, anorganică, analitică"),
            ("Biologie",      "Genetică, Microbiologie, Anatomie"),
            ("Istorie",       "Istorie mondială, Istorie europeană"),
            ("Limbi Străine", "Engleză, Franceză, Germană, Spaniolă"),
            ("Economie",      "Macroeconomie, Management, Marketing"),
        ];

        public static async Task InitializeAsync(ApplicationDbContext context, UserManager<ApplicationUser> userManager, RoleManager<IdentityRole> roleManager)
        {
            if (context.Database.IsSqlServer())
            {
                await context.Database.MigrateAsync();
            }
            else
            {
                await context.Database.EnsureCreatedAsync();
            }

            string[] roles = { "Admin", "Student" };
            foreach (var role in roles)
            {
                if (!await roleManager.RoleExistsAsync(role))
                {
                    await roleManager.CreateAsync(new IdentityRole(role));
                }
            }

            // Migrate existing English subject names → Romanian
            bool changed = false;
            foreach (var (oldName, newName, newDesc) in SubjectMigrations)
            {
                var subject = await context.Subjects.FirstOrDefaultAsync(s => s.Name == oldName);
                if (subject != null)
                {
                    subject.Name = newName;
                    subject.Description = newDesc;
                    changed = true;
                }
            }
            if (changed) await context.SaveChangesAsync();

            // Seed Romanian subjects if table is empty
            if (!context.Subjects.Any())
            {
                foreach (var (name, desc) in RomanianSubjects)
                    context.Subjects.Add(new Subject { Name = name, Description = desc });
                await context.SaveChangesAsync();
            }

            if (!userManager.Users.Any())
            {
                var admin = new ApplicationUser
                {
                    UserName = "admin@studybuddy.com",
                    Email = "admin@studybuddy.com",
                    FirstName = "System",
                    LastName = "Admin",
                    Faculty = "Administration",
                    University = "StudyBuddy Hub"
                };

                await userManager.CreateAsync(admin, "Admin123!");
                await userManager.AddToRoleAsync(admin, "Admin");
            }
        }
    }
}
