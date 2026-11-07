interface Window {
  google?: {
    accounts: {
      id: {
        initialize(config: { client_id: string; callback: (r: { credential: string }) => void }): void;
        renderButton(el: HTMLElement, options: Record<string, unknown>): void;
      };
    };
  };
}