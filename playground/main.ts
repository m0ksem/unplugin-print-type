export type DataTableItem = Record<string, any>

export type DataTableRowBind = Record<string, string> | ((item: DataTableItem, index: number) => Record<string, string>)

const textarea = document.createElement('textarea')
textarea.value = Untype<DataTableRowBind>('DataTableRowBind').definition
document.getElementById('app')!.appendChild(textarea)
