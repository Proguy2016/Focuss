import { AppAction } from '../types';

class StateManager {
    private static dispatch: React.Dispatch<AppAction> | null = null;

    static setDispatch(dispatch: React.Dispatch<AppAction>) {
        StateManager.dispatch = dispatch;
    }

    static resetState() {
        if (StateManager.dispatch) {
            StateManager.dispatch({ type: 'RESET_STATE' });
        }
    }
}

export default StateManager; 