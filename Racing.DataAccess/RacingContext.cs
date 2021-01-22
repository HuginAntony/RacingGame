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

            OnModelCreatingPartial(modelBuilder);
        }

     

        partial void OnModelCreatingPartial(ModelBuilder modelBuilder);
    }
}
