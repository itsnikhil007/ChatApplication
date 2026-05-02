package com.substring.chat.controllers;

//import com.substring.chat.config.AppConstant;
import com.substring.chat.entities.Message;
import com.substring.chat.entities.Room;
import com.substring.chat.playload.MessageRequest;
import com.substring.chat.repositories.RoomRepository;
import org.springframework.messaging.handler.annotation.DestinationVariable;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.SendTo;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.RequestBody;

import java.time.LocalDateTime;
import java.util.List;

@Controller
@CrossOrigin(origins = "${frontend.url}")
public class ChatController {

    private RoomRepository roomRepository;
    private final SimpMessagingTemplate messagingTemplate;

    public ChatController(RoomRepository roomRepository, SimpMessagingTemplate messagingTemplate) {
        this.roomRepository = roomRepository;
        this.messagingTemplate = messagingTemplate;
    }

    //for sending and receving messages
    @MessageMapping("/sendMessage/{roomId}") //app/sendMessage/roomId
    @SendTo("/topic/room/{roomId}") //subscribe
    public Message sendMessage(
            @DestinationVariable String roomId,
            @RequestBody MessageRequest request)
    {

        Room room = roomRepository.findByRoomId(roomId);

        Message message = new Message();
        message.setContent(request.getContent());
        message.setSender(request.getSender());
        message.setTimestamp(LocalDateTime.now());

        if(room != null) {
            room.getMessages().add(message);
            roomRepository.save(room);
        }else{
            throw new RuntimeException("Room not found");
        }
        return message;
    }

    @MessageMapping("/getUsers/{roomId}")
    public void getActiveUsers(@DestinationVariable String roomId) {
        Room room = roomRepository.findByRoomId(roomId);
        if (room == null) return;

        List<String> activeUsers = room.getActiveUsers();

        messagingTemplate.convertAndSend(
                "/topic/room/" + roomId + "/users",
                activeUsers
        );
    }
}


