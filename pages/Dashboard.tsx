import React, { useEffect, useState } from 'react'
import { accountsService } from '../services/accountsService'
import { scriptsService } from '../services/scriptsService'
import { AdAccount, Script } from '../types'
import { Plus, Trash2, Edit, Save, CreditCard } from 'lucide-react'

const Accounts: React.FC = () => {
  const [accounts, setAccounts] = useState<AdAccount[]>([])
  const [scripts, setScripts] = useState<Script[]>([])
  const [searchTerm, setSearchTerm] = useState('')

  const [isDrawerOpen, setIsDrawerOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)

  const [accName, setAccName] = useState('')
  const [accId, setAccId] = useState('')

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    const [accs, scrs] = await Promise.all([
      accountsService.getAll(),
      scriptsService.getAll()
    ])

    setAccounts(accs || [])
    setScripts(scrs || [])
  }

  const openCreate = () => {
    setEditingId(null)
    setAccName('')
    setAccId('')
    setIsDrawerOpen(true)
  }

  const openEdit = (acc: AdAccount) => {
    setEditingId(acc.id)
    setAccName(acc.account_name)
    setAccId(acc.account_id)
    setIsDrawerOpen(true)
  }

  const handleDelete = async (id: string) => {
    await accountsService.delete(id)
    await loadData()
  }

  const handleSave = async () => {
    if (!accName || !accId) return

    if (editingId) {
      await accountsService.update(editingId, {
        account_name: accName,
        account_id: accId
      })
    } else {
      await accountsService.create({
        account_name: accName,
        account_id: accId
      })
    }

    setIsDrawerOpen(false)
    await loadData()
  }

  const filtered = accounts.filter(a =>
    a.account_name.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className="p-8 text-white">
      <div className="flex justify-between mb-6">
        <h1 className="text-xl font-bold">Contas</h1>
        <button onClick={openCreate} className="bg-indigo-600 px-4 py-2 flex gap-2">
          <Plus size={14}/> Nova
        </button>
      </div>

      <table className="w-full text-sm">
        <tbody>
          {filtered.map(acc => (
            <tr key={acc.id}>
              <td>{acc.account_name}</td>
              <td>{acc.account_id}</td>
              <td className="flex gap-2">
                <button onClick={() => openEdit(acc)}><Edit size={14}/></button>
                <button onClick={() => handleDelete(acc.id)}><Trash2 size={14}/></button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {isDrawerOpen && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center">
          <div className="bg-[#111] p-6 space-y-3 w-[360px]">
            <input value={accName} onChange={e=>setAccName(e.target.value)} placeholder="Nome" />
            <input value={accId} onChange={e=>setAccId(e.target.value)} placeholder="ID" />
            <button onClick={handleSave}><Save size={14}/> Salvar</button>
          </div>
        </div>
      )}
    </div>
  )
}

export default Accounts
