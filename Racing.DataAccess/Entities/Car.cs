#nullable disable

namespace Racing.DataAccess.Entities
{
    public class Car
    {
        public int Id { get; set; }
        public string Name { get; set; }
        public int Acceleration { get; set; }
        public int Braking { get; set; }
        public int CorneringAbility { get; set; }
        public int TopSpeed { get; set; }

        private int CalculateStraightScore()
        {
            return Acceleration + TopSpeed;
        }

        private int CalculateCorneringScore()
        {
            return Braking + CorneringAbility;
        }

        public int CalculateTrackScore(string trackPath)
        {
            int score = 0;

            foreach (var s in trackPath)
            {
                if (s == '1')
                {
                    score += CalculateStraightScore();
                }
                else
                {
                    score += CalculateCorneringScore();
                }
            }

            return score;
        }

        public override string ToString()
        {
            return $"Name: {Name}\nAcceleration: {Acceleration}\n" +
                   $"Braking: {Braking}\nCorneringAbility: {CorneringAbility}\n" +
                   $"TopSpeed: {TopSpeed}";
        }
    }
}
