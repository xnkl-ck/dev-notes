class HeroModern {
    // 1. 使用 # 定义真正的私有方法
    #getRandom(min, max) { 
        return Math.random() * (max - min) + min;
    }

    constructor(attack, hp, defence) {
        this.attack = attack;
        this.hp = hp;
        this.defence = defence;
    }

    gongji() {
        // 2. 在类内部，通过 this.#getRandom 访问
        const dmg = this.attack * this.#getRandom(0.8, 1.1);
        console.log(dmg);
    }
}
const hModern = new HeroModern(3, 6, 3);

// 尝试使用 Symbol 的“钥匙”来获取 #getRandom 方法的键
const sybs = Object.getOwnPropertySymbols(HeroModern.prototype);
console.log(sybs)
console.log(sybs[0] === Symbol.for("#getRandom"))
console.log(hModern[sybs[0]](0.8, 1.1))
