# WhatsApp-like Chat Application - Frontend

## Overview
The frontend of this real-time chat application provides the user interface for interacting with the chat system. It's built to offer a responsive and intuitive messaging experience, allowing users to send, edit, delete, and view messages in real-time.

## Features
*   **Real-time messaging**: Displays messages as they are sent and received.
*   **CRUD operations for messages**:
    *   Input field for sending new messages.
    *   UI elements (pencil icon) to edit existing messages.
    *   UI elements (trash icon) to delete messages.
    *   Displays message history.
*   **User identification**: Allows users to enter a sender ID.
*   **Responsive design**: Adapts to various screen sizes with modern UI components.
*   **Connection status indicator**: Provides visual feedback on WebSocket connection status.
*   **Message timestamps**: Shows when messages were sent.
*   **Edit indicators**: Visually marks messages that have been modified.
*   **Automatic scrolling**: Scrolls to the bottom when new messages arrive.

## Tech Stack
*   **React**: Frontend framework for building the user interface.
*   **Vite**: Fast build tool and development server for React.
*   **Tailwind CSS**: Utility-first CSS framework for styling.
*   **shadcn/ui**: A collection of re-usable UI components.
*   **Lucide React**: Icon library for various UI elements.
*   **Socket.IO Client**: JavaScript library for real-time WebSocket communication with the backend.

## Project Structure
