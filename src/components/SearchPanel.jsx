import { useState, useRef } from 'react'

const SEARCH_TYPES = [
  { id: 'username', label: 'Username', icon: '👤', placeholder: 'e.g. johndoe or @johndoe', hint: 'Checks 18+ social platforms' },
  { id: 'email', label: 'Email', icon: '✉️', placeholder: 'e.g. john@example.com', hint: 'Gravatar, Hunter.io, breach check' },
  { id: 'phone', label: 'Phone', icon: '📱', placeholder: 'e.g. +61412345678', hint: 'Carrier, country, line type' },
  { id: 'image', label: 'Image', icon: '🖼️', placeholder: 'Drop an image or click to upload', hint: 'Google Vision reverse search' },
]

export default function SearchPanel({ searchType, onTypeChange, onSearch, loading }) {
  const [query, setQuery] = useState('')
  const [imageFile, setImageFile] = useState(null)
  const [imagePreview, setImagePreview] = useState(null)
  const [isDragging, setIsDragging] = useState(false)
  const fileInputRef = useRef(null)

  const currentType = SEARCH_TYPES.find(t => t.id === searchType)

  const handleImageFile = (file) => {
    if (!file || !file.type.startsWith('image/')) return
    setImageFile(file)
    const reader = new FileReader()
    reader.onload = (e) => setImagePreview(e.target.result)
    reader.readAsDataURL(file)
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (loading) return
    if (searchType === 'image') {
      if (!imageFile) return
      const reader = new FileReader()
      reader.onload = (e) => {
        onSearch({ base64: e.target.result, filename: imageFile.name }, 'image')
      }
      reader.readAsDataURL(imageFile)
    } else {
      if (!query.trim()) return
      onSearch(query.trim(), searchType)
    }
  }

  const handleDrop = (e) => {
    e.preventDefault()
    setIsDragging(false)
    const file = e.dataTransfer.files[0]
    handleImageFile(file)
  }

  const clearImage = () => {
    setImageFile(null)
    setImagePreview(null)
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  return (
    <div className="mb-8">
      {/* Type selector tabs */}
      <div className="flex gap-2 mb-4 p-1 rounded-2xl bg-bg-card border border-border max-w-xl mx-auto">
        {SEARCH_TYPES.map((type) => (
          <button
            key={type.id}
            onClick={() => { onTypeChange(type.id); setQuery(''); clearImage() }}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl text-sm font-medium transition-all duration-200 ${
              searchType === type.id
                ? 'bg-accent-purple text-white shadow-lg'
                : 'text-text-muted hover:text-text-primary hover:bg-bg-elevated'
            }`}
            style={searchType === type.id ? { boxShadow: '0 0 20px rgba(108,99,255,0.4)' } : {}}
          >
            <span className="text-base leading-none">{type.icon}</span>
            <span className="hidden sm:inline">{type.label}</span>
          </button>
        ))}
      </div>

      {/* Search form */}
      <form onSubmit={handleSubmit} className="max-w-2xl mx-auto">
        <div className="card-glow rounded-2xl border border-border bg-bg-card overflow-hidden">
          {searchType === 'image' ? (
            /* Image upload area */
            <div
              className={`relative p-6 transition-all duration-200 cursor-pointer ${
                isDragging ? 'bg-accent-purple/10 border-accent-purple/50' : ''
              }`}
              onDragOver={(e) => { e.preventDefault(); setIsDragging(true) }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={handleDrop}
              onClick={() => !imagePreview && fileInputRef.current?.click()}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => handleImageFile(e.target.files[0])}
              />
              {imagePreview ? (
                <div className="flex items-center gap-4">
                  <img src={imagePreview} alt="Preview" className="w-20 h-20 object-cover rounded-xl border border-border" />
                  <div className="flex-1">
                    <p className="text-text-primary font-medium">{imageFile?.name}</p>
                    <p className="text-text-muted text-sm">{imageFile ? (imageFile.size / 1024).toFixed(1) + ' KB' : ''}</p>
                    <button
                      type="button"
                      onClick={(e) => { e.stopPropagation(); clearImage() }}
                      className="text-accent-red text-xs mt-1 hover:underline"
                    >
                      Remove image
                    </button>
                  </div>
                </div>
              ) : (
                <div className="text-center py-4">
                  <div className="text-4xl mb-3">🖼️</div>
                  <p className="text-text-primary font-medium">Drop an image or click to upload</p>
                  <p className="text-text-muted text-sm mt-1">PNG, JPG, WEBP — max 20MB</p>
                  <p className="text-text-dim text-xs mt-2">Powered by Google Vision reverse image search</p>
                </div>
              )}
            </div>
          ) : (
            /* Text input */
            <div className="flex items-center">
              <span className="pl-4 pr-2 text-text-muted text-lg">{currentType?.icon}</span>
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={currentType?.placeholder}
                className="flex-1 bg-transparent py-4 px-2 text-text-primary placeholder-text-dim focus:outline-none text-base"
                autoFocus
              />
            </div>
          )}

          {/* Submit row */}
          <div className="flex items-center justify-between px-4 py-3 border-t border-border bg-bg-elevated/50">
            <span className="text-text-dim text-xs mono">{currentType?.hint}</span>
            <button
              type="submit"
              disabled={loading || (searchType === 'image' ? !imageFile : !query.trim())}
              className={`flex items-center gap-2 px-5 py-2 rounded-xl text-sm font-semibold transition-all duration-200 ${
                loading || (searchType === 'image' ? !imageFile : !query.trim())
                  ? 'bg-bg-elevated text-text-dim cursor-not-allowed'
                  : 'bg-accent-purple text-white hover:opacity-90 active:scale-95'
              }`}
              style={!(loading || (searchType === 'image' ? !imageFile : !query.trim())) ? {
                boxShadow: '0 0 20px rgba(108,99,255,0.4)'
              } : {}}
            >
              {loading ? (
                <>
                  <span className="w-3.5 h-3.5 border-2 border-text-dim border-t-transparent rounded-full animate-spin" />
                  Searching...
                </>
              ) : (
                <>🔍 Search</>
              )}
            </button>
          </div>
        </div>
      </form>
    </div>
  )
}
