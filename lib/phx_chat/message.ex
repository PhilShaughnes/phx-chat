defmodule PhxChat.Message do
  use Ecto.Schema
  import Ecto.Changeset


  schema "messages" do
    field :message, :string
    field :name, :string

    timestamps()
  end

  @doc false
  def changeset(message, attrs) do
    message
    |> cast(attrs, [:name, :message])
    |> validate_required([:name, :message])
  end

  @doc false
  def get_messages(limit \\ 20) do
  PhxChat.Repo.all(PhxChat.Message, limit: limit)
  end
end
