use std::time::Duration;

use ractor::{rpc::CallResult, ActorCell, Message, MessagingErr, RpcReplyPort};

pub trait ActorCellExt {
    async fn call<TMessage, TReply, TMsgBuilder>(
        &self,
        msg_builder: TMsgBuilder,
        timeout_option: Option<Duration>,
    ) -> Result<CallResult<TReply>, MessagingErr<TMessage>>
    where
        TMessage: Message,
        TMsgBuilder: FnOnce(RpcReplyPort<TReply>) -> TMessage;
}

impl ActorCellExt for ActorCell {
    async fn call<TMessage, TReply, TMsgBuilder>(
        &self,
        msg_builder: TMsgBuilder,
        timeout_option: Option<Duration>,
    ) -> Result<CallResult<TReply>, MessagingErr<TMessage>>
    where
        TMessage: Message,
        TMsgBuilder: FnOnce(RpcReplyPort<TReply>) -> TMessage,
    {
        ractor::rpc::call(self, msg_builder, timeout_option).await
    }
}
