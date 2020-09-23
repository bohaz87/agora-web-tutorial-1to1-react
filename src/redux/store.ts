import { createStore } from 'redux'
import rootReducer, {RootState} from './reducer'

const store = createStore(rootReducer, {} as RootState)

export default store
