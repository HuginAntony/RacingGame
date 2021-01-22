using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Racing.DataAccess.Entities;

namespace Racing.DataAccess.EntityConfiguration
{
    public class TrackConfiguration : IEntityTypeConfiguration<Track>
    {
        public void Configure(EntityTypeBuilder<Track> entity)
        {
            entity.ToTable("Track");

            entity.Property(e => e.Id).ValueGeneratedNever();

            entity.Property(e => e.Name)
                  .HasMaxLength(50)
                  .IsUnicode(false);

            entity.Property(e => e.TrackPath)
                  .IsRequired()
                  .HasMaxLength(4000)
                  .IsUnicode(false);
        }
    }
}