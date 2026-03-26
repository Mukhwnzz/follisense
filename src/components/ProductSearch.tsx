import { useState, useRef, useEffect } from 'react';
import { Search, X, Plus } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { searchProducts, getProductDisplayName, type Product } from '@/data/productDatabase';

interface ProductSearchProps {
  category: 'scalp' | 'hair';
  selectedProducts: string[];
  onProductsChange: (products: string[]) => void;
  placeholder?: string;
  noneLabel?: string;
}

const ProductSearch = ({ category, selectedProducts, onProductsChange, placeholder, noneLabel }: ProductSearchProps) => {
  const [query, setQuery] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);
  const [showCustomInput, setShowCustomInput] = useState(false);
  const [customProduct, setCustomProduct] = useState('');
  const noneSelected = selectedProducts.length === 1 && selectedProducts[0] === 'None';
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const results = searchProducts(query, category);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node) &&
          inputRef.current && !inputRef.current.contains(e.target as Node)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const addProduct = (displayName: string) => {
    if (!selectedProducts.includes(displayName)) {
      onProductsChange([...selectedProducts.filter(p => p !== 'None'), displayName]);
    }
    setQuery('');
    setShowDropdown(false);
  };

  const removeProduct = (name: string) => {
    onProductsChange(selectedProducts.filter(p => p !== name));
  };

  const handleNone = () => {
    if (noneSelected) {
      onProductsChange([]);
    } else {
      onProductsChange(['None']);
    }
  };

  const addCustom = () => {
    if (customProduct.trim()) {
      addProduct(customProduct.trim());
      setCustomProduct('');
      setShowCustomInput(false);
    }
  };

  const defaultPlaceholder = category === 'scalp'
    ? 'Search products, e.g., Mielle, Nizoral, castor oil...'
    : 'Search products, e.g., SheaMoisture, Olaplex, leave-in...';

  return (
    <div className="space-y-3">
      {/* Search input */}
      <div className="relative">
        <div className={`flex items-center h-12 px-4 rounded-xl border-2 border-border bg-card transition-colors focus-within:border-primary ${noneSelected ? 'opacity-40 pointer-events-none' : ''}`}>
          <Search size={16} className="text-muted-foreground mr-2 flex-shrink-0" strokeWidth={1.8} />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={e => { setQuery(e.target.value); setShowDropdown(true); }}
            onFocus={() => setShowDropdown(true)}
            placeholder={placeholder || defaultPlaceholder}
            className="flex-1 bg-transparent text-foreground text-sm placeholder:text-muted-foreground focus:outline-none"
            disabled={noneSelected}
          />
          {query && (
            <button onClick={() => { setQuery(''); }} className="p-1">
              <X size={14} className="text-muted-foreground" />
            </button>
          )}
        </div>

        {/* Dropdown */}
        {showDropdown && query.length >= 2 && !noneSelected && (
          <div ref={dropdownRef} className="absolute z-50 top-full left-0 right-0 mt-1 bg-card border border-border rounded-xl shadow-lg overflow-hidden max-h-[280px] overflow-y-auto">
            {results.length > 0 ? (
              <>
                {results.map(product => {
                  const displayName = getProductDisplayName(product);
                  const isAdded = selectedProducts.includes(displayName);
                  return (
                    <button
                      key={product.id}
                      onClick={() => !isAdded && addProduct(displayName)}
                      className={`w-full text-left px-4 py-3 flex items-center gap-3 transition-colors ${isAdded ? 'opacity-50 bg-accent' : 'hover:bg-accent'}`}
                      disabled={isAdded}
                    >
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-foreground truncate">
                          {product.brand !== 'Generic' && product.brand !== 'Homemade' && (
                            <span className="text-primary">{product.brand}</span>
                          )}
                          {product.brand !== 'Generic' && product.brand !== 'Homemade' ? ' ' : ''}
                          {product.name}
                        </p>
                      </div>
                      <span className="text-xs text-muted-foreground bg-accent px-2 py-0.5 rounded-full flex-shrink-0">{product.type}</span>
                      {isAdded && <span className="text-xs text-primary font-medium">Added</span>}
                    </button>
                  );
                })}
                <button
                  onClick={() => { setShowCustomInput(true); setShowDropdown(false); }}
                  className="w-full text-left px-4 py-3 border-t border-border hover:bg-accent transition-colors"
                >
                  <p className="text-sm text-primary font-medium">Can't find your product? Add your own</p>
                </button>
              </>
            ) : (
              <div className="px-4 py-4">
                <p className="text-sm text-muted-foreground mb-2">No results for "{query}"</p>
                <button
                  onClick={() => { setShowCustomInput(true); setShowDropdown(false); }}
                  className="text-sm text-primary font-medium"
                >
                  Add it manually
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Custom input */}
      {showCustomInput && (
        <div className="flex items-center gap-2">
          <input
            type="text"
            value={customProduct}
            onChange={e => setCustomProduct(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && addCustom()}
            placeholder="Type product name"
            className="flex-1 h-10 px-3 rounded-xl border-2 border-border bg-card text-foreground text-sm placeholder:text-muted-foreground focus:outline-none focus:border-primary transition-colors"
            autoFocus
          />
          <button onClick={addCustom} disabled={!customProduct.trim()} className="h-10 px-4 rounded-xl bg-primary text-primary-foreground text-sm font-medium disabled:opacity-50">
            Add
          </button>
          <button onClick={() => { setShowCustomInput(false); setCustomProduct(''); }} className="h-10 px-2">
            <X size={16} className="text-muted-foreground" />
          </button>
        </div>
      )}

      {/* Selected products chips */}
      {selectedProducts.length > 0 && !noneSelected && (
        <div className="flex flex-wrap gap-2">
          {selectedProducts.map(name => (
            <div key={name} className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-primary/10 border border-primary/20">
              <span className="text-xs font-medium text-foreground max-w-[200px] truncate">{name}</span>
              <button onClick={() => removeProduct(name)} className="p-0.5">
                <X size={12} className="text-muted-foreground hover:text-foreground" />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* None option, styled as comfortable opt-out card */}
      {noneLabel && (
        <button
          onClick={handleNone}
          className={`w-full text-center py-3.5 rounded-xl border transition-all duration-200 ${
            noneSelected
              ? 'border-primary bg-primary/5 text-foreground font-medium'
              : 'border-border/60 bg-secondary/30 text-muted-foreground hover:bg-secondary/50'
          }`}
        >
          <p className={`text-sm ${noneSelected ? 'font-medium' : ''}`}>{noneLabel}</p>
        </button>
      )}
    </div>
  );
};

export default ProductSearch;
