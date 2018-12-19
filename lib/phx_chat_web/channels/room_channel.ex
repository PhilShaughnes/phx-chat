defmodule PhxChatWeb.RoomChannel do
  require IEx
  use PhxChatWeb, :channel
  alias PhxChatWeb.Presence

  def join("room:lobby", _, socket) do
    send(self(), :after_join)
    {:ok, socket}
  end

  def handle_info(:after_join, socket) do
    Presence.track(socket, socket.assigns.user, %{online_at: :os.system_time(:milli_seconds)})
    # IEx.pry
    push(socket, "presence_state", Presence.list(socket))
    {:noreply, socket}
  end

  def handle_in("message:new", message, socket) do
    # PhxChat.Message.changeset(%PhxChat.Message{}, message) |> PhxChat.Repo.insert
    # IEx.pry

    broadcast!(socket, "message:new", %{
      name: socket.assigns.user,
      message: message["message"],
      timestamp: :os.system_time(:milli_seconds)
    })

    {:noreply, socket}
  end
end
