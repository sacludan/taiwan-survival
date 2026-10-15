/**
 * 【模組：角色與技能資料庫 characters.js】
 * v42：統一道具 ID 為 milk_tea，確保開局食物能正常點擊彈窗
 */
const GAME_CHARACTERS = {
  roar_brother: {
    id: "roar_brother",
    name: "戰神咆哮哥",
    title: "立院戰神",
    baseAtk: 15,
    baseDef: 5,
    maxHp: 120,
    hp: 120,
    maxSp: 100,
    sp: 100,
    zone: "ly",
    bag: ["milk_tea"], // 對齊 items_food.js 裡的 key
    equip: {
      weapon: null,
      head: null,
      chest: null,
      arm: null,
      leg: null,
      acc: null
    },
    skill: {
      name: "太離譜了！",
      icon: "📢",
      cd: 10,
      costSp: 15,
      desc: "發動震懾全場的咆哮，造成高額爆擊傷害！",
      cast: (caster, target) => {
        const dmg = 35 + Math.floor(Math.random() * 15);
        target.hp = Math.max(0, target.hp - dmg);
        return {
          dmg: dmg,
          log: `大喊：「太離譜了！」施展專屬絕技！對 ${target.name} 造成 <span class="text-purple-400 font-bold">${dmg}</span> 點音波爆擊！`
        };
      }
    }
  },

  buzz_uncle: {
    id: "buzz_uncle",
    name: "嗡嗡阿伯",
    title: "自律狂魔",
    baseAtk: 14,
    baseDef: 8,
    maxHp: 130,
    hp: 130,
    maxSp: 100,
    sp: 100,
    alive: true,
    zone: "ly",
    bag: ["sausage"],
    equip: {
      weapon: null,
      head: null,
      chest: null,
      arm: null,
      leg: null,
      acc: null
    },
    skill: {
      name: "嗡嗡嗡",
      icon: "🐝",
      cd: 8,
      costSp: 10,
      desc: "開啟瘋狂自律連打模式，重創對手！",
      cast: (caster, target) => {
        const dmg = 25 + Math.floor(Math.random() * 12);
        target.hp = Math.max(0, target.hp - dmg);
        return {
          dmg: dmg,
          log: `${caster.name} 開啟嗡嗡自律模式！對 ${target.name} 連環輸出造成 <span class="text-rose-400 font-bold">${dmg}</span> 點傷害！`
        };
      }
    }
  }
};
