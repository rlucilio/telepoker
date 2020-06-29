import socketServer from '../../socket-server';
import { EventsReceivedsSocket } from '../../events-receiveds';
import { VoteUsecase } from '../usecase/vote.usecase';
import { IVoteRequest } from './request/vote.request';
import { EventsEmmiterSocket } from '../../events-emmiter';
import { FlipVotesUsecase } from '../usecase/flip-votes.usecase';
import { IFlipRequest } from './request/flip.request';
import { Log } from '../../../log/log';

export class VoteListener {
  onVote () {
    socketServer.addEventListener().then(socket => {
      socket.on(EventsReceivedsSocket.voteTask, (voteRequest: IVoteRequest) => {
        Log.info(`Vote in task -> ${socket.id}`);
        Log.info(`Room -> ${socket.handshake.query.room}`);

        try {
          new VoteUsecase().execute(voteRequest).subscribe(result =>
            socket.to(voteRequest.roomName).emit(result.event, result.user));
        } catch (error) {
          socket.emit(EventsEmmiterSocket.error, error);
        }
      });
    });
  }

  onFlip () {
    socketServer.addEventListener().then(socket => {
      socket.on(EventsReceivedsSocket.flipVotes, (flipRequest: IFlipRequest) => {
        Log.info(`Flip in votes -> ${socket.id}`);
        Log.info(`Room -> ${socket.handshake.query.room}`);

        try {
          new FlipVotesUsecase().execute({
            nameRoom: flipRequest.roomName,
            taskId: flipRequest.taskId
          });
        } catch (error) {
          socket.emit(EventsEmmiterSocket.error, error);
        }
      });
    });
  }
}