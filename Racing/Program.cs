using System;
using System.Collections.Generic;
using System.Linq;
using Racing.DataAccess;
using Racing.DataAccess.Entities;

namespace Racing
{
    class Program
    {
        static void Main(string[] args)
        {
            var db = new RacingContext();
            var cars = db.Cars.ToList();
            var tracks = db.Tracks.ToList();

            Console.WriteLine("Welcome to the racing game.");
            Console.WriteLine();
            Console.WriteLine("Please select a racing track by entering the Track Id. Press the Enter key after input.");
            
            PrintTrackInfo(tracks);

            var input = Console.ReadLine();
            var selectedTrack = int.Parse(input);


            Console.WriteLine("These are the cars participating in the race:");
            Console.WriteLine();

            PrintCarInfo(cars);

            var results = new Dictionary<int, int>();

            Console.WriteLine("Press any key to start the race");
            Console.ReadKey();

            foreach (var car in cars)
            {
                results.Add(car.Id, car.CalculateTrackScore(tracks.Single(t => t.Id == selectedTrack).TrackPath));
            }

            OutputResults(results, cars);

            Console.ReadKey();
        }

        private static void OutputResults(Dictionary<int, int> results, List<Car> cars)
        {
            Console.WriteLine();
            Console.WriteLine("The results are in order from 1st to last:");
            Console.WriteLine();

            foreach (var result in results.OrderByDescending(c => c.Value))
            {
                var thisCar = cars.Single(c => c.Id == result.Key);

                Console.WriteLine($"Car Name: {thisCar.Name}, Score: {result.Value}");
            }
        }

        private static void PrintCarInfo(List<Car> cars)
        {
            foreach (var car in cars)
            {
                Console.WriteLine(car.ToString());
                Console.WriteLine();
            }
        }

        private static void PrintTrackInfo(List<Track> tracks)
        {
            foreach (var track in tracks)
            {
                Console.WriteLine(track.ToString());
            }
        }
    }
}
