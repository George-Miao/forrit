// use std::{fmt::Display, sync::LazyLock};

// use stringmetrics::{hamming, levenshtein_limit};
// use unicode_normalization::{is_nfkd_quick, IsNormalized,
// UnicodeNormalization};

// #[derive(Debug, Clone, Copy)]
// pub struct SimStr<S>(S);

// impl<S> SimStr<S> {
//     pub fn new(s: S) -> Self {
//         Self(s)
//     }

//     pub fn into_inner(self) -> S {
//         self.0
//     }
// }

// impl<S: Display> Display for SimStr<S> {
//     fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
//         self.0.fmt(f)
//     }
// }

// impl<S: AsRef<str>> PartialEq for SimStr<S> {
//     fn eq(&self, other: &Self) -> bool {
//         str_sim(self.0.as_ref(), other.0.as_ref())
//     }
// }

// pub fn str_sim(a: &str, b: &str) -> bool {
//     if is_nfkd_quick(a.chars()) == IsNormalized::Yes &&
// is_nfkd_quick(b.chars()) == IsNormalized::Yes {         // If both are ascii,
// compare with hamming distance         hamming(a, b).map(|d| d <
// 2).unwrap_or(false)     } else {
//         // Or, try to comapre after normalized
//         (a.nfkd().eq(b.nfkd())) ||
//         // Or, try to normalize and compare with levenshtein distance
//         (levenshtein_limit(&a.nfkd().collect::<String>(),
// &b.nfkd().collect::<String>(), 3) < 3)     }
// }

// #[cfg(test)]
// mod tests {
//     use super::*;

//     #[test]
//     fn test_eq() {
//         assert!(str_sim("SF西遊記 スタージンガー",
// "ＳＦ西遊記スタージンガー"));         assert!(!str_sim("12312", "123"));
//         assert!(!str_sim("ドロロンえん魔くん", "ドロロンえ"));
//         assert!(str_sim("ドロロンえん魔くん", "ドロロンえん魔くん"));
//         assert!(str_sim("新造人間キャシャーン", "新造人間キャシャーン"));
//         assert!(str_sim("空手バカ一代", "空手バカ一代"));
//         assert!(str_sim("アルプスの少女ハイジ", "アルプスの少女ハイジ"));
//         assert!(str_sim("昆虫物語 新みなしごハッチ", "昆虫物語
// 新みなしごハッチ"));         assert!(str_sim("チャージマン研!",
// "チャージマン研！"));         assert!(str_sim("星の子チョビン",
// "星の子チョビン"));         assert!(str_sim("ゲッターロボ", "ゲッターロボ"));
//         assert!(str_sim("破裏拳ポリマー", "破裏拳ポリマー"));
//         assert!(str_sim("はじめ人間ギャートルズ", "はじめ人間ギャートルズ"));
//         assert!(str_sim("宇宙戦艦ヤマト", "宇宙戦艦ヤマト"));
//         assert!(str_sim("フランダースの犬", "フランダースの犬"));
//         assert!(str_sim("勇者ライディーン", "勇者ライディーン"));
//         assert!(str_sim("ドン・チャック物語", "ドン・チャック物語"));
//         assert!(str_sim("ガンバの冒険", "ガンバの冒険"));
//         assert!(str_sim("宇宙の騎士テッカマン", "宇宙の騎士テッカマン"));
//         assert!(str_sim("一休さん", "一休さん"));
//         assert!(str_sim(
//             "アラビアンナイト シンドバットの冒険",
//             "アラビアンナイト シンドバットの冒険"
//         ));
//         assert!(str_sim("鋼鉄ジーグ", "鋼鉄ジーグ"));
//         assert!(str_sim("元祖天才バカボン", "元祖天才バカボン"));
//         assert!(str_sim("タイムボカン", "タイムボカン"));
//         assert!(str_sim("ハックルベリィの冒険", "ハックルベリィの冒険"));
//         assert!(str_sim("母をたずねて三千里", "母をたずねて三千里"));
//         assert!(str_sim("大空魔竜ガイキング", "大空魔竜ガイキング"));
//         assert!(str_sim("マシンハヤブサ", "マシンハヤブサ"));
//         assert!(str_sim("ゴワッパー5ゴーダム", "ゴワッパー5 ゴーダム"));
//         assert!(str_sim("abc", "abc"));
//         assert!(str_sim("abc", "ａｂｃ"));
//         assert!(str_sim("2", "２"));
//     }
// }
