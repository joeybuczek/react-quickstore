import React from "react";

// Create context
const QuickStoreContext = React.createContext({});

// Main QuickStore component
class QuickStore extends React.Component {
  // Static properties
  static defaultProps = {
    asyncReducer: null,
    didMount: null,
    initialState: {},
    reducer: null
  };
  static noOp = () => {};

  // State storage
  initialState = { ...this.props.initialState };
  state = this.initialState;

  // Lifecycle
  componentDidMount() {
    const { didMount } = this.props;
    if (didMount !== undefined) {
      const provider = this;
      // Handle array of functions
      if (didMount && Array.isArray(didMount)) {
        didMount.forEach(
          fn => typeof fn === "function" && fn(provider.getStateAndHelpers())
        );
      }
      // Handle single function
      if (didMount && typeof didMount === "function") {
        didMount(provider.getStateAndHelpers());
      }
    }
  }

  // Handle async reducer actions first
  providerSetStateAsync(action, callback) {
    // If action (new incoming changes) is a function, get result, otherwise pass along
    const actionObject =
      typeof action === "function" ? action(this.state) : action;
    const { asyncReducer } = this.props;
    if (typeof asyncReducer === "function") {
      // Apply async reducer if provided then pass result to sync process
      asyncReducer(this.state, actionObject).then(reducedAsyncAction => {
        this.providerSetState(reducedAsyncAction, callback);
      });
    } else {
      // Otherwise pass directly to sync process
      this.providerSetState(actionObject, callback);
    }
  }

  // Internal setState to handle both simple and reducer solutions
  providerSetState(action, callback) {
    // If action (new incoming changes) is a function, get result, otherwise pass along
    const actionObject =
      typeof action === "function" ? action(this.state) : action;

    this.setState(state => {
      // Apply stateReducer if supplied
      const { reducer } = this.props;
      const reducedAction =
        typeof reducer === "function"
          ? reducer(state, actionObject) || {}
          : actionObject;

      // Remove type property since it's reserved for reducers
      const { type: reservedType, ...finalAction } = reducedAction;

      // Only re-render if changes are made, otherwise avoid it with null
      return Object.keys(reducedAction).length
        ? { ...state, ...finalAction }
        : null;
    }, callback);
  }

  // API functions
  dispatch = (actions, callback = Provider.noOp) => {
    this.providerSetStateAsync(actions, () => callback(this.state));
  };

  // Provide the combined state/helper value to Provider
  getStateAndHelpers() {
    return {
      state: this.state,
      dispatch: this.dispatch
    };
  }

  render() {
    return (
      <QuickStoreContext.Provider value={this.getStateAndHelpers()}>
        {this.props.children}
      </QuickStoreContext.Provider>
    );
  }
}

// Exports
export const Provider = QuickStore;
export const { Consumer } = QuickStoreContext;
export default {
  Provider: QuickStore,
  Consumer: QuickStoreContext.Consumer
};
