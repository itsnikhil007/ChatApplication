package com.substring.chat.config;

import com.substring.chat.entities.Room;
import com.substring.chat.repositories.RoomRepository;
import org.springframework.context.event.EventListener;
import org.springframework.messaging.simp.stomp.StompHeaderAccessor;
import org.springframework.stereotype.Component;
import org.springframework.web.socket.messaging.SessionConnectEvent;
import org.springframework.web.socket.messaging.SessionDisconnectEvent;

@Component
public class WebSocketEventListener {

    private final RoomRepository roomRepository;

    public WebSocketEventListener(RoomRepository roomRepository) {
        this.roomRepository = roomRepository;
    }

    @EventListener
    public void handleConnect(SessionConnectEvent event) {
        StompHeaderAccessor accessor = StompHeaderAccessor.wrap(event.getMessage());

        System.out.println("ALL HEADERS: " + accessor.toNativeHeaderMap());
        String roomId   = accessor.getFirstNativeHeader("roomId");
        String userName = accessor.getFirstNativeHeader("userName");

        if (roomId != null && userName != null) {
            accessor.getSessionAttributes().put("roomId", roomId);
            accessor.getSessionAttributes().put("userName", userName.toLowerCase());
        }
    }

    @EventListener
    public void handleDisconnect(SessionDisconnectEvent event) {
        StompHeaderAccessor accessor = StompHeaderAccessor.wrap(event.getMessage());

        String roomId   = (String) accessor.getSessionAttributes().get("roomId");
        String userName = (String) accessor.getSessionAttributes().get("userName");

        System.out.println("DISCONNECT → roomId: " + roomId + ", userName: " + userName);

        if (roomId == null || userName == null) return;

        Room room = roomRepository.findByRoomId(roomId);
        if (room == null) return;

        room.getActiveUsers().remove(userName.toLowerCase());
        roomRepository.save(room);

        System.out.println("Removed ->" + userName + " from " + roomId);
    }
}
