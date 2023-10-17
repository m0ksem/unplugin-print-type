interface Gamer { name: string; games: string[] }
interface User<Child = Gamer> { name: string; children: Child[] }

console.log(PrintType<User>())
