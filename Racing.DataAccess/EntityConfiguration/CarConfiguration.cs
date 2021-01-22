using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Racing.DataAccess.Entities;

namespace Racing.DataAccess.EntityConfiguration
{
    public class CarConfiguration : IEntityTypeConfiguration<Car>
    {
        public void Configure(EntityTypeBuilder<Car> entity)
        {
            entity.ToTable("Car");

            entity.Property(e => e.Id).ValueGeneratedNever();

            entity.Property(e => e.Acceleration)
                  .IsRequired();

            entity.Property(e => e.Braking)
                  .IsRequired();

            entity.Property(e => e.CorneringAbility)
                  .IsRequired();

            entity.Property(e => e.TopSpeed)
                  .IsRequired();

            entity.Property(e => e.Name)
                  .IsRequired()
                  .HasMaxLength(50)
                  .IsUnicode(false);
        }
    }
}