pub trait Notifier {
    type Error: std::error::Error;
    type MessageHandle;

    /// Send a notification to the user. Optionally this can return a handle to
    /// the message so that it can be updated later.
    async fn notify(&self, message: String) -> Result<Option<Self::MessageHandle>, Self::Error>;

    /// Send an update regards to a previous notification. This is default to be
    /// sending a new notification. But can also be override by the
    /// implementor so that platforms that supports updating can utilize such
    /// function.
    async fn update(&self, _: Self::MessageHandle, message: String) -> Result<(), Self::Error> {
        self.notify(message).await?;
        Result::<(), Self::Error>::Ok(())
    }
}
