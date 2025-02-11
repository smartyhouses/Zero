"use client";
import { ArrowRight, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import Link from "next/link";

interface GoogleConnection {
  id: string;
  email: string;
  name?: string;
  picture?: string;
  createdAt: Date;
}
export default function ConnectEmails() {
  const [connections, setConnections] = useState<GoogleConnection[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchConnections = async () => {
    try {
      const response = await fetch("/api/gmail/connections");
      const data = await response.json();
      setConnections(data.connections);
    } catch (error) {
      toast.error("Failed to load connected accounts");
    } finally {
      setLoading(false);
    }
  };

  const disconnectAccount = async (connectionId: string) => {
    try {
      await fetch(`/api/gmail/connections/${connectionId}`, {
        method: "DELETE",
      });
      toast.success("Account disconnected successfully");
      fetchConnections(); // Refresh the list
    } catch (error) {
      toast.error("Failed to disconnect account");
    }
  };

  useEffect(() => {
    fetchConnections();
  }, []);

  return (
    <div className="flex h-dvh w-screen items-center justify-center bg-background">
      <div className="flex w-full max-w-md flex-col gap-2 overflow-hidden rounded-2xl">
        <div className="flex flex-col items-center justify-center gap-1 px-4 text-center sm:px-16">
          <h3 className="text-xl font-semibold dark:text-zinc-50">Connect your emails</h3>
          <p className="text-sm text-gray-500 dark:text-zinc-400">
            Connect your emails to your Mail0 account
          </p>
        </div>
        <div className="px-4 sm:px-16">
          {loading ? (
            <div className="flex justify-center">
              <Loader2 className="h-6 w-6 animate-spin text-gray-500" />
            </div>
          ) : connections.length > 0 ? (
            <div className="space-y-2">
              <h4 className="text-sm font-medium text-gray-500">Connected Accounts</h4>
              {connections.map((connection) => (
                <div
                  key={connection.id}
                  className="flex items-center justify-between rounded-lg border p-3"
                >
                  <div className="flex items-center gap-3">
                    {connection.picture ? (
                      <img src={connection.picture} alt="" className="h-8 w-8 rounded-full" />
                    ) : (
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="1em"
                        height="1em"
                        viewBox="0 0 24 24"
                        className="h-8 w-8"
                      >
                        <path
                          fill="currentColor"
                          d="M11.99 13.9v-3.72h9.36c.14.63.25 1.22.25 2.05c0 5.71-3.83 9.77-9.6 9.77c-5.52 0-10-4.48-10-10S6.48 2 12 2c2.7 0 4.96.99 6.69 2.61l-2.84 2.76c-.72-.68-1.98-1.48-3.85-1.48c-3.31 0-6.01 2.75-6.01 6.12s2.7 6.12 6.01 6.12c3.83 0 5.24-2.65 5.5-4.22h-5.51z"
                        ></path>
                      </svg>
                    )}
                    <div className="flex flex-col">
                      <span className="text-sm font-medium">
                        {connection.name || connection.email}
                      </span>
                      {connection.name && (
                        <span className="text-xs text-gray-500">{connection.email}</span>
                      )}
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-red-500 hover:text-red-600"
                    onClick={() => disconnectAccount(connection.id)}
                  >
                    Disconnect
                  </Button>
                </div>
              ))}
            </div>
          ) : null}
        </div>
        <div className="flex flex-col items-center justify-center space-y-4 px-4 sm:px-16">
          <Button
            variant="outline"
            className="w-72 gap-2"
            onClick={() => {
              window.location.href = "/api/auth/google";
            }}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 24 24">
              <path
                fill="currentColor"
                d="M11.99 13.9v-3.72h9.36c.14.63.25 1.22.25 2.05c0 5.71-3.83 9.77-9.6 9.77c-5.52 0-10-4.48-10-10S6.48 2 12 2c2.7 0 4.96.99 6.69 2.61l-2.84 2.76c-.72-.68-1.98-1.48-3.85-1.48c-3.31 0-6.01 2.75-6.01 6.12s2.7 6.12 6.01 6.12c3.83 0 5.24-2.65 5.5-4.22h-5.51z"
              ></path>
            </svg>
            Connect Gmail Account
          </Button>
          <Link href="/mail">
            <Button variant="ghost" className="w-fit gap-2">
              Back to mail <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
