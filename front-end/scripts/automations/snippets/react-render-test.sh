RENDER_TEST="import React from 'react';\n
import { shallow } from 'enzyme';\n
import $VIEW_NAME from '../index';\n
\n
it('renders without crashing', () => {\n
  shallow(\n
    <$VIEW_NAME />\n
  );\n
});\n
"