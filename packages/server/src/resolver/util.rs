use std::{char, sync::LazyLock};

use regex::Regex;
use tap::Pipe;

pub fn is_mostly_ascii(s: &str) -> bool {
    s.chars()
        .fold((0, 0), |(ascii, non_ascii), c| {
            if c.is_ascii() {
                (ascii + 1, non_ascii)
            } else {
                (ascii, non_ascii + 1)
            }
        })
        .pipe(|(ascii, non_ascii)| ascii > non_ascii * 2)
}

pub fn match_title_in_filename(filename: &str) -> Option<(&str, &str)> {
    static REG: LazyLock<Regex> = LazyLock::new(|| {
        Regex::new(r#"[\[\]【】\(\)]([^\[\]【】\(\)]{4,}?)[/／\-_]([^\[\]【】\(\)]{4,}?)[\[\]【】\(\)]"#).unwrap()
    });

    REG.captures(filename)
        .map(|cap| (cap.get(1).unwrap().as_str().trim(), cap.get(2).unwrap().as_str().trim()))
}

pub fn remove_postfix(mut title: &str) -> &str {
    const POSTFIX: &[&str] = &[
        "II", "III", "IV", "V", "VI", "VII", "2nd", "3rd", "4th", "5th", "6th", "7th",
    ];
    if title.chars().count() < 2 {
        return title;
    };

    // "Some Title 2" -> "Some Title "
    let mut chars = title.chars().rev();
    let last = chars.next().unwrap();
    let second = chars.next().unwrap();
    drop(chars);
    if last.is_numeric() && !second.is_numeric() {
        title = &title[..title.len() - last.len_utf8()];
    }

    // "Some Title II" -> "Some Title"
    for p in POSTFIX {
        if title.ends_with(p) {
            title = &title[..title.len() - p.len()];
            break;
        }
    }

    title.trim()
}

/// "Some title [bracketed]" -> "Some title"
pub fn remove_bracket(title: &str) -> &str {
    const BRACKETS: &[(char, char)] = &[
        ('(', ')'),
        ('（', '）'),
        ('[', ']'),
        ('【', '】'),
        ('{', '}'),
        ('「', '」'),
        ('『', '』'),
        ('〔', '〕'),
        ('〖', '〗'),
        ('〘', '〙'),
        ('〚', '〛'),
        ('~', '~'),
        ('～', '～'),
        ('-', '-'),
    ];

    let Some(last_char) = title.chars().last() else {
        return title;
    };

    if let Some(open) = BRACKETS
        .iter()
        .find_map(|(l, r)| if *r == last_char { Some(*l) } else { None })
    {
        title
            .char_indices()
            .rev()
            .find(|(_, c)| *c == open)
            .map(|(idx, _)| &title[..idx])
            .unwrap_or(title)
            .pipe(|x| if x.is_empty() { title } else { x })
    } else {
        title
    }
}

pub fn cut_title(title: &str, cut: usize) -> Option<&str> {
    const SEP: &[char] = &['/', '／', '-', '_'];
    let t = remove_bracket(title.trim()).trim();

    if cut == 0 {
        return Some(t);
    }

    let t_idx = t
        .char_indices()
        .filter_map(|(idx, c)| {
            if c.is_whitespace() || SEP.contains(&c) {
                Some(idx)
            } else {
                None
            }
        })
        .rev()
        .nth(cut - 1)?;

    Some(t.split_at(t_idx).0)
}

#[test]
fn test_match_title() {
    let filename = "【喵萌奶茶屋】★01月新番★[到了30歲還是處男，似乎會變成魔法師 / 30-sai made Doutei dato Mahoutsukai \
                    ni Nareru Rashii / Cherimaho][09][1080p][繁日雙語][招募翻譯時軸]";
    // assert_eq!(match_title_in_filename(filename), Some(("无脑魔女", "Agate -
    // 27")));
    println!("{:?}", match_title_in_filename(filename));
}

#[test]
fn test_remove_postfix() {
    let title = "Some Title II";
    assert_eq!(remove_postfix(title), "Some Title");

    let title = "Some Title 2";
    assert_eq!(remove_postfix(title), "Some Title");
}

#[test]
fn test_cut() {
    let title = "火狩りの王 Season2";
    assert_eq!(cut_title(title, 0), Some("火狩りの王 Season2"));
    assert_eq!(cut_title(title, 1), Some("火狩りの王"));
    assert_eq!(cut_title(title, 2), None);

    let title = "ガンダムビルドダイバーズRe:RISE 2nd Season";
    assert_eq!(cut_title(title, 0), Some("ガンダムビルドダイバーズRe:RISE 2nd Season"));
    assert_eq!(cut_title(title, 1), Some("ガンダムビルドダイバーズRe:RISE 2nd"));
    assert_eq!(cut_title(title, 2), Some("ガンダムビルドダイバーズRe:RISE"));
}
