// src/context/CompanyContext.jsx
// Holds the "active company" selection + company list — persists across page navigation
import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { companyApi } from '../services/api';

const CompanyContext = createContext(null);

const STORAGE_KEY = 'eco_active_company_id';

export function CompanyProvider({ children }) {
  const [companies,      setCompanies]      = useState([]);
  const [activeCompany,  setActiveCompany]  = useState(null);
  const [loading,        setLoading]        = useState(true);

  const loadCompanies = useCallback(async () => {
    setLoading(true);
    try {
      const list = await companyApi.list();
      setCompanies(list);

      // Restore previously-selected company, else default to first
      const savedId = localStorage.getItem(STORAGE_KEY);
      const found   = list.find(c => c.id === savedId) || list[0] || null;
      setActiveCompany(found);
    } catch {
      setCompanies([]);
      setActiveCompany(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadCompanies(); }, [loadCompanies]);

  const switchCompany = useCallback((company) => {
    setActiveCompany(company);
    if (company) localStorage.setItem(STORAGE_KEY, company.id);
    else         localStorage.removeItem(STORAGE_KEY);
  }, []);

  const addCompany = useCallback((company) => {
    setCompanies(prev => [...prev, company]);
    switchCompany(company);
  }, [switchCompany]);

  const updateCompany = useCallback((updated) => {
    setCompanies(prev => prev.map(c => c.id === updated.id ? updated : c));
    setActiveCompany(prev => prev?.id === updated.id ? updated : prev);
  }, []);

  const removeCompany = useCallback((id) => {
    setCompanies(prev => {
      const next = prev.filter(c => c.id !== id);
      setActiveCompany(curr => {
        if (curr?.id === id) {
          const replacement = next[0] || null;
          if (replacement) localStorage.setItem(STORAGE_KEY, replacement.id);
          else             localStorage.removeItem(STORAGE_KEY);
          return replacement;
        }
        return curr;
      });
      return next;
    });
  }, []);

  return (
    <CompanyContext.Provider value={{
      companies, activeCompany, loading,
      switchCompany, addCompany, updateCompany, removeCompany, loadCompanies,
    }}>
      {children}
    </CompanyContext.Provider>
  );
}

export function useCompany() {
  const ctx = useContext(CompanyContext);
  if (!ctx) throw new Error('useCompany must be inside CompanyProvider');
  return ctx;
}
