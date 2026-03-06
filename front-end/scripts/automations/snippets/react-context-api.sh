CONTEXT_CONTENT="import { createContext } from 'react';\n
\n
const initialState = {\n
   viewName: '$VIEW_NAME',\n
   routePath: '$VIEW_ROUTE'\n
}\n
\n
const ${VIEW_NAME}Context = createContext(initialState);\n
\n
export const { Consumer, Provider } = ${VIEW_NAME}Context;\n
export default ${VIEW_NAME}Context;"