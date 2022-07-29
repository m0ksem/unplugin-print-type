export type DataTableAlignOptions = 'left' | 'center' | 'right'
export type DataTableVerticalAlignOptions = 'top' | 'middle' | 'bottom'

export type DataTableColumnClass = unknown | (() => unknown)
export type DataTableColumnStyle = unknown | (() => unknown)

export type DataTableSortingOrder = 'asc' | 'desc' | null
export type DataTableSortingOptions = DataTableSortingOrder[]

// provided column definitions (<va-data-table `:columns="myColumns"` />)
// should look like an array of the following objects (and/or strings)
export interface DataTableColumn {
  [key: string]: any
  key: string // name of an item's property: 'userName', 'address.zipCode'
  name?: string // column unique name (used in slots)
  label?: string // what to display in the respective heading
  thTitle?: string // <th>'s `title` attribute's value
  sortable?: boolean // whether the table can be sorted by that column
  sortingFn?: (a: any, b: any) => number // a custom sorting function. `a` and `b` are currently compared cells' original values (sources). Must return a number (see the standard JS's Array.prototype.sort)
  sortingOptions?: DataTableSortingOptions
  thAlign?: DataTableAlignOptions // horizontal alignment
  thVerticalAlign?: DataTableVerticalAlignOptions // vertical alignment
  tdAlign?: DataTableAlignOptions // horizontal alignment
  tdVerticalAlign?: DataTableVerticalAlignOptions // vertical alignment
  width?: string | number
  thClass?: DataTableColumnClass
  tdClass?: DataTableColumnClass
  thStyle?: DataTableColumnStyle
  tdStyle?: DataTableColumnStyle

  /** @deprecated use `thTitle` instead */
  headerTitle?: string

  /** @deprecated use `thAlign` instead */
  alignHead?: DataTableAlignOptions

  /** @deprecated use `thVerticalAlign` instead */
  verticalAlignHead?: DataTableVerticalAlignOptions

  /** @deprecated use `tdAlign` instead */
  align?: DataTableAlignOptions

  /** @deprecated use `tdVerticalAlign` instead */
  verticalAlign?: DataTableVerticalAlignOptions

  /** @deprecated use `tdClass` instead */
  classes?: DataTableColumnClass

  /** @deprecated use `thClass` instead */
  headerClasses?: DataTableColumnClass

  /** @deprecated use `tdStyle` instead */
  style?: DataTableColumnStyle

  /** @deprecated use `thStyle` instead */
  headerStyle?: DataTableColumnStyle
}

console.log(Untype<DataTableColumn>('DataTableColumn').definition)
// const textarea = document.createElement('textarea')
// textarea.value = Untype<DataTableColumn>('DataTableColumn').definition
// document.getElementById('app')!.appendChild(textarea)
