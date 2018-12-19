defmodule PhxChatWeb.RoomChannel do
  use PhxChatWeb, :channel
  alias PhxChatWeb.Presence

  def join("room:lobby", _, socket) do
    send(self(), :after_join)
    {:ok, socket}
  end

  def handle_info(:after_join, socket) do
    Presence.track(socket, socket.assigns.user, %{online_at: :os.system_time(:milli_seconds)})
    push(socket, "presence_state", Presence.list(socket))

    PhxChat.Message.get_messages()
    |> Enum.each(fn msg -> push(socket, "message:new", %{
      name: msg.name,
      message: msg.message,
      timestamp: "---"
    }) end)

    {:noreply, socket}
  end

  def handle_in("message:new", message, socket) do
    PhxChat.Message.changeset(%PhxChat.Message{}, message) |> PhxChat.Repo.insert

    broadcast!(socket, "message:new", %{
      name: message["name"],
      message: message["message"],
      timestamp: :os.system_time(:milli_seconds)
    })

    {:noreply, socket}
  end
end
