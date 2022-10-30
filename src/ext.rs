use std::{fmt::Display, ops::Deref};

use forrit_core::Subscription;
use unicode_width::UnicodeWidthStr;

pub trait SubscriptionExt {
    /// Properly display CJK names
    fn display(&self, padding: usize) -> SubscriptionDisplay;
}

impl SubscriptionExt for Subscription {
    fn display(&self, padding: usize) -> SubscriptionDisplay {
        SubscriptionDisplay { sub: self, padding }
    }
}

pub struct SubscriptionDisplay<'a> {
    sub: &'a Subscription,
    padding: usize,
}

impl Display for SubscriptionDisplay<'_> {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        let bangumi = &self.sub.bangumi.name;
        let padding = self.padding - bangumi.width_cjk();
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
