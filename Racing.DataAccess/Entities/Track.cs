﻿#nullable disable

namespace Racing.DataAccess.Entities
{
    public class Track
    {
        public int Id { get; set; }
        public string Name { get; set; }
        public string TrackPath { get; set; }

        public override string ToString()
        {
            return $"Id: {Id}, Name: {Name}";
        }
    }
}
