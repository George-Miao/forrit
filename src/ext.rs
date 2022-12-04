use std::{fmt::Display, ops::Deref};

use forrit_core::BangumiSubscription;
use unicode_width::UnicodeWidthStr;

pub trait SubscriptionExt {
    /// Properly display CJK names
    fn display(&self, padding: usize) -> SubscriptionDisplay;
}

impl SubscriptionExt for BangumiSubscription {
    fn display(&self, padding: usize) -> SubscriptionDisplay {
        SubscriptionDisplay { sub: self, padding }
    }
}

pub struct SubscriptionDisplay<'a> {
    sub: &'a BangumiSubscription,
    padding: usize,
}

impl Display for SubscriptionDisplay<'_> {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        let bangumi = &self.sub.bangumi.name;
        let padding = self.padding.saturating_sub(bangumi.width_cjk());
        let team = self
            .sub
            .team
            .as_ref()
            .map(|x| x.name.deref().as_str())
            .unwrap_or("");
        write!(
            f,
            "{bangumi}{:padding$} S{} {team}",
            "",
            self.sub.season.unwrap_or(1)
        )
    }
}
