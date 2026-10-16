/**
 * 【資料模組：武器 items_weapon.js】
 * v59：收錄 1～5 階台灣特色武器與數值、幹話描述
 */
const WEAPONS_DATA = {
  items: {
    plastic_stool: { name: "塑膠折凳", type: "weapon", atk: 4, score: 40, desc: "七武器之首，藏於民居之中，隨處可見。" },
    protest_megaphone: { name: "抗議大聲公", type: "weapon", atk: 5, score: 50, desc: "聲音就是正義，開道喊口號必備。" },
    love_pointer: { name: "愛的小手", type: "weapon", atk: 3, score: 30, desc: "童年的恐怖陰影，打下去啪啪作響。" },
    wooden_stick: { name: "木棒", type: "weapon", atk: 6, score: 60, desc: "路上隨便撿都有的防身木棍。" },
    rusty_cleaver: { name: "生鏽菜刀", type: "weapon", atk: 7, score: 70, desc: "傳統市場攤販用來剁骨頭的凶器。" },
    box_cutter: { name: "大支美工刀", type: "weapon", atk: 6, score: 65, desc: "文具店買的工業用大美工刀，很利。" },
    convenience_umbrella: { name: "超商摺疊傘", type: "weapon", atk: 4, score: 45, desc: "傘骨戳人也是會痛的。" },

    rusty_nail_club: { name: "帶釘折凳", type: "weapon", atk: 11, score: 120, desc: "加上生鏽鐵釘的折凳，殺傷力倍增。" },
    mod_megaphone: { name: "改裝大聲公", type: "weapon", atk: 12, score: 130, desc: "音量加倍，震得對手耳鳴。" },
    reinforced_ruler: { name: "加粗愛的小手", type: "weapon", atk: 9, score: 100, desc: "綁了膠帶加粗，打人更痛。" },
    wolf_bat: { name: "狼牙木棒", type: "weapon", atk: 13, score: 140, desc: "釘滿鐵釘的木棒，散發危險氣息。" },
    opening_machete: { name: "開山西瓜刀", type: "weapon", atk: 15, score: 160, desc: "西瓜刀一出，誰與爭鋒。" },

    iron_stool: { name: "強化鐵皮折凳", type: "weapon", atk: 20, score: 220, desc: "鐵皮打造的折凳，重量與破壞力兼具。" },
    broadcast_amplifier: { name: "里長廣播擴音器", type: "weapon", atk: 21, score: 230, desc: "全里都聽得到你的咆哮。" },
    discipline_cane: { name: "訓導處藤條", type: "weapon", atk: 18, score: 200, desc: "主任專用，風聲呼呼作響。" },
    aluminum_bat: { name: "鋁合金球棒", type: "weapon", atk: 22, score: 240, desc: "輕巧好揮，打擊感十足。" },
    shark_sword: { name: "八家將鯊魚劍", type: "weapon", atk: 24, score: 260, desc: "法器加持，驅邪鎮煞。" },

    ultimate_stool: { name: "霸王帶釘折凳", type: "weapon", atk: 32, score: 350, desc: "結合鐵皮與高爆彈的究極折凳。" },
    legislative_thunder: { name: "立院咆哮雷神大聲公", type: "weapon", atk: 33, score: 360, desc: "一吼震山河，國會打架神器。" },
    grandma_cane: { name: "阿嬤的愛心藤條", type: "weapon", atk: 30, score: 330, desc: "蘊含阿嬤無限關愛的恐怖藤條。" },
    taichung_bat: { name: "台中球棒", type: "weapon", atk: 35, score: 380, desc: "車上必備，象徵台中的浪漫。" },

    mythic_stool: { name: "弒神七武器之首(終極折凳)", type: "weapon", atk: 48, score: 550, desc: "傳說中的神兵利器，融合台灣價值與究極折凳，一擊毀天滅地！" }
  }
};
window.ITEMS_WEAPON = WEAPONS_DATA.items;
