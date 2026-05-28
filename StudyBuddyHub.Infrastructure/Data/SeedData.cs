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

        private static readonly (string Name, string Desc, string ImageUrl, string ImageUrl2)[] RomanianSubjects =
        [
            ("Matematică",    "Calcul, Algebră, Geometrie",
                "https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=400&auto=format&fit=crop&q=80",
                "https://images.unsplash.com/photo-1509228468518-180dd4864904?w=400&auto=format&fit=crop&q=80"),
            ("Informatică",   "Programare, Algoritmi, Structuri de date",
                "https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=400&auto=format&fit=crop&q=80",
                "https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=400&auto=format&fit=crop&q=80"),
            ("Fizică",        "Mecanică, Termodinamică, Fizică cuantică",
                "https://images.unsplash.com/photo-1636466497217-26a8cbeaf0aa?w=400&auto=format&fit=crop&q=80",
                "https://images.unsplash.com/photo-1518152006812-edab29b069ac?w=400&auto=format&fit=crop&q=80"),
            ("Chimie",        "Chimie organică, anorganică, analitică",
                "https://images.unsplash.com/photo-1532187863486-abf9dbad1b69?w=400&auto=format&fit=crop&q=80",
                "https://images.unsplash.com/photo-1603126857599-f6e157fa2fe6?w=400&auto=format&fit=crop&q=80"),
            ("Biologie",      "Genetică, Microbiologie, Anatomie",
                "https://images.unsplash.com/photo-1530026186672-2cd00ffc50fe?w=400&auto=format&fit=crop&q=80",
                "https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=400&auto=format&fit=crop&q=80"),
            ("Istorie",       "Istorie mondială, Istorie europeană",
                "https://images.unsplash.com/photo-1461360370896-922624d12aa1?w=400&auto=format&fit=crop&q=80",
                "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&auto=format&fit=crop&q=80"),
            ("Limbi Străine", "Engleză, Franceză, Germană, Spaniolă",
                "https://images.unsplash.com/photo-1546410531-bb4caa6b424d?w=400&auto=format&fit=crop&q=80",
                "https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=400&auto=format&fit=crop&q=80"),
            ("Economie",      "Macroeconomie, Management, Marketing",
                "https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=400&auto=format&fit=crop&q=80",
                "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=400&auto=format&fit=crop&q=80"),
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
                foreach (var (name, desc, imageUrl, imageUrl2) in RomanianSubjects)
                    context.Subjects.Add(new Subject { Name = name, Description = desc, ImageUrl = imageUrl, ImageUrl2 = imageUrl2 });
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
