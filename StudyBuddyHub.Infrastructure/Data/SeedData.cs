using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using StudyBuddyHub.Core.Entities;
using StudyBuddyHub.Core.Enums;
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
            await context.Database.MigrateAsync();

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

                var students = new[]
                {
                    new ApplicationUser { UserName = "ana.pop@student.ro", Email = "ana.pop@student.ro", FirstName = "Ana", LastName = "Pop", Faculty = "Informatică", University = "UBB Cluj" },
                    new ApplicationUser { UserName = "mihai.ionescu@student.ro", Email = "mihai.ionescu@student.ro", FirstName = "Mihai", LastName = "Ionescu", Faculty = "Matematică", University = "Politehnica București" },
                    new ApplicationUser { UserName = "elena.radu@student.ro", Email = "elena.radu@student.ro", FirstName = "Elena", LastName = "Radu", Faculty = "Fizică", University = "UBB Cluj" },
                    new ApplicationUser { UserName = "andrei.stan@student.ro", Email = "andrei.stan@student.ro", FirstName = "Andrei", LastName = "Stan", Faculty = "Informatică", University = "ASE București" },
                };

                foreach (var student in students)
                {
                    await userManager.CreateAsync(student, "Student123!");
                    await userManager.AddToRoleAsync(student, "Student");
                }

                // Seed study offers după ce avem useri și subiecte
                var subjects = await context.Subjects.ToListAsync();
                if (subjects.Any())
                {
                    var informatica = subjects.First(s => s.Name == "Informatică");
                    var matematica = subjects.First(s => s.Name == "Matematică");
                    var fizica = subjects.First(s => s.Name == "Fizică");

                    var ana = await userManager.FindByEmailAsync("ana.pop@student.ro");
                    var mihai = await userManager.FindByEmailAsync("mihai.ionescu@student.ro");
                    var elena = await userManager.FindByEmailAsync("elena.radu@student.ro");

                    context.StudyOffers.AddRange(
                        new StudyOffer { Title = "Meditații Programare C#", Description = "Ajut studenți cu programare orientată pe obiecte, design patterns și .NET.", Level = Level.Intermediate, SessionType = SessionType.Online, Price = 50, IsActive = true, SubjectId = informatica.Id, OwnerId = ana!.Id },
                        new StudyOffer { Title = "Algoritmi și Structuri de Date", Description = "Pregătire pentru examene și concursuri de algoritmică.", Level = Level.Advanced, SessionType = SessionType.Hybrid, Price = 60, IsActive = true, SubjectId = informatica.Id, OwnerId = ana!.Id },
                        new StudyOffer { Title = "Analiză Matematică", Description = "Limite, derivate, integrale — explicații clare pas cu pas.", Level = Level.Beginner, SessionType = SessionType.OnSite, Price = 40, IsActive = true, SubjectId = matematica.Id, OwnerId = mihai!.Id },
                        new StudyOffer { Title = "Algebră Liniară", Description = "Spații vectoriale, matrice, transformări liniare.", Level = Level.Intermediate, SessionType = SessionType.Online, Price = 45, IsActive = true, SubjectId = matematica.Id, OwnerId = mihai!.Id },
                        new StudyOffer { Title = "Fizică Mecanică", Description = "Cinematică, dinamică, legi ale lui Newton — pregătire examen.", Level = Level.Beginner, SessionType = SessionType.OnSite, Price = 35, IsActive = true, SubjectId = fizica.Id, OwnerId = elena!.Id }
                    );
                    await context.SaveChangesAsync();
                }
            }
        }
    }
}
