use std::{future::Future, time::Duration};

use ractor::{rpc::CallResult, ActorCell, Message, MessagingErr, RpcReplyPort};

pub trait ActorCellExt {
    fn call<TMessage, TReply, TMsgBuilder>(
        &self,
        msg_builder: TMsgBuilder,
        timeout_option: Option<Duration>,
    ) -> impl Future<Output = Result<CallResult<TReply>, MessagingErr<TMessage>>> + Send
    where
        TMessage: Message + Send,
        TReply: Send,
        TMsgBuilder: Send + FnOnce(RpcReplyPort<TReply>) -> TMessage;
}

impl ActorCellExt for ActorCell {
    fn call<TMessage, TReply, TMsgBuilder>(
        &self,
        msg_builder: TMsgBuilder,
        timeout_option: Option<Duration>,
    ) -> impl Future<Output = Result<CallResult<TReply>, MessagingErr<TMessage>>> + Send
    where
        TMessage: Message + Send,
        TReply: Send,
        TMsgBuilder: Send + FnOnce(RpcReplyPort<TReply>) -> TMessage,
    {
        ractor::rpc::call(self, msg_builder, timeout_option)
    }
}
