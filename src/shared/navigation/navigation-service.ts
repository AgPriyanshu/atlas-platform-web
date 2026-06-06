type NavigateFn = (to: string) => void;

let _navigate: NavigateFn | null = null;

export const navigationService = {
  setNavigate(fn: NavigateFn) {
    _navigate = fn;
  },

  navigate(to: string) {
    if (_navigate) {
      _navigate(to);
    } else {
      console.warn(
        "[NavigationService] navigate called before router mounted."
      );
    }
  },
};
