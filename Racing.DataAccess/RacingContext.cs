using System.Collections.Generic;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Racing.DataAccess.Entities;
using Racing.DataAccess.EntityConfiguration;

#nullable disable

namespace Racing.DataAccess
{
    public partial class RacingContext : DbContext
    {
        public RacingContext()
        {
        }

        public RacingContext(DbContextOptions<RacingContext> options)
            : base(options)
        {
        }

        public virtual DbSet<Car> Cars { get; set; }
        public virtual DbSet<Track> Tracks { get; set; }

        protected override void OnConfiguring(DbContextOptionsBuilder optionsBuilder)
        {
            if (!optionsBuilder.IsConfigured)
            {
                optionsBuilder.UseSqlServer("Server=localhost;Database=Racing;Trusted_Connection=True;Integrated Security=SSPI;");
            }
        }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            modelBuilder.HasAnnotation("Relational:Collation", "SQL_Latin1_General_CP1_CI_AS");

            modelBuilder.ApplyConfiguration(new CarConfiguration());
            modelBuilder.ApplyConfiguration(new TrackConfiguration());

            SeedData(modelBuilder);
            OnModelCreatingPartial(modelBuilder);
        }

        private void SeedData(ModelBuilder modelBuilder)
        {
            var cars = new List<Car>
            {
                new Car
                {
                    Id = 1,
                    Name = "CORV",
                    Acceleration = 8,
                    Braking = 3,
                    CorneringAbility = 4,
                    TopSpeed = 9
                },
                new Car
                {
                    Id = 2,
                    Name = "GTR",
                    Acceleration = 6,
                    Braking = 7,
                    CorneringAbility = 9,
                    TopSpeed = 8
                },
                new Car
                {
                    Id = 3,
                    Name = "MUSTANG",
                    Acceleration = 7,
                    Braking = 4,
                    CorneringAbility = 4,
                    TopSpeed = 9
                },
            };

            var tracks = new List<Track>
            {
                new Track
                {
                    Id = 1,
                    Name = "Yas Marina",
                    TrackPath = "11110011100011001110011101"
                },
                new Track
                {
                    Id = 2,
                    Name = "Daytona",
                    TrackPath = "11111111001111110111100001"
                },
            };

            modelBuilder.Entity<Car>().HasData(cars);
            modelBuilder.Entity<Track>().HasData(tracks);
        }

        partial void OnModelCreatingPartial(ModelBuilder modelBuilder);
    }
}
