'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'

interface Alumni {
  id: string
  name: string
  email: string
  phone?: string
  graduationYear: number
  degree: string
  department: string
  currentJob?: string
  company?: string
  location?: string
  linkedinUrl?: string
  bio?: string
  profilePicture?: string
  createdAt: string
  updatedAt: string
}

export default function AlumniPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [alumni, setAlumni] = useState<Alumni[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterYear, setFilterYear] = useState('')
  const [filterDepartment, setFilterDepartment] = useState('')

  useEffect(() => {
    fetchAlumni()
  }, [])

  const fetchAlumni = async () => {
    try {
      setIsLoading(true)
      const response = await fetch('/api/alumni')
      
      if (!response.ok) {
        throw new Error('Failed to fetch alumni')
      }
      
      const data = await response.json()
      setAlumni(data)
    } catch (error) {
      setError('Failed to load alumni. Please try again later.')
    } finally {
      setIsLoading(false)
    }
  }

  const filteredAlumni = alumni.filter(person => {
    const matchesSearch = person.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         person.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         person.company?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         person.currentJob?.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesYear = filterYear === '' || person.graduationYear.toString() === filterYear
    const matchesDepartment = filterDepartment === '' || person.department === filterDepartment
    
    return matchesSearch && matchesYear && matchesDepartment
  })

  const uniqueYears = [...new Set(alumni.map(person => person.graduationYear))].sort((a, b) => b - a)
  const uniqueDepartments = [...new Set(alumni.map(person => person.department))].sort()

  // Show loading state
  if (status === 'loading') {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <div className="animate-pulse">Loading...</div>
        </div>
      </div>
    )
  }

  // Redirect if not authenticated
  if (status === 'unauthenticated') {
    // router.push('/login')
    // return null
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-800 mb-8">Alumni Directory</h1>
      
      {/* Welcome message for authenticated user */}
      {session?.user?.alumni && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <p className="text-blue-800">
            Welcome, <span className="font-semibold">{session.user.alumni.name}</span>! 
            Class of {session.user.alumni.graduationYear} • {session.user.alumni.department}
          </p>
        </div>
      )}
      
      {/* Filters */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-1">
              Search
            </label>
            <input
              type="text"
              id="search"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by name, email, company, or job title..."
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          
          <div>
            <label htmlFor="year" className="block text-sm font-medium text-gray-700 mb-1">
              Graduation Year
            </label>
            <select
              id="year"
              value={filterYear}
              onChange={(e) => setFilterYear(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Years</option>
              {uniqueYears.map(year => (
                <option key={year} value={year}>{year}</option>
              ))}
            </select>
          </div>
          
          <div>
            <label htmlFor="department" className="block text-sm font-medium text-gray-700 mb-1">
              Department
            </label>
            <select
              id="department"
              value={filterDepartment}
              onChange={(e) => setFilterDepartment(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Departments</option>
              {uniqueDepartments.map(dept => (
                <option key={dept} value={dept}>{dept}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Alumni Cards */}
      {isLoading ? (
        <div className="text-center py-8">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <p className="mt-2 text-gray-600">Loading alumni...</p>
        </div>
      ) : filteredAlumni.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-gray-600">
            {alumni.length === 0 ? 'No alumni found. Add some alumni from the admin dashboard.' : 'No alumni match your search criteria.'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredAlumni.map((person) => (
            <div key={person.id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-200">
              <div className="p-6">
                <div className="flex items-center mb-4">
                  {person.profilePicture ? (
                    <img
                      src={person.profilePicture}
                      alt={person.name}
                      className="w-16 h-16 rounded-full object-cover mr-4"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.style.display = 'none';
                        target.nextElementSibling?.classList.remove('hidden');
                      }}
                    />
                  ) : null}
                  <div className={`w-16 h-16 rounded-full bg-blue-500 flex items-center justify-center text-white text-xl font-bold mr-4 ${person.profilePicture ? 'hidden' : ''}`}>
                    {person.name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-800">{person.name}</h3>
                    <p className="text-sm text-gray-600">Class of {person.graduationYear}</p>
                  </div>
                </div>
                
                <div className="space-y-2 text-sm">
                  <p><span className="font-medium">Degree:</span> {person.degree}</p>
                  <p><span className="font-medium">Department:</span> {person.department}</p>
                  
                  {person.currentJob && (
                    <p><span className="font-medium">Current Role:</span> {person.currentJob}</p>
                  )}
                  
                  {person.company && (
                    <p><span className="font-medium">Company:</span> {person.company}</p>
                  )}
                  
                  {person.location && (
                    <p><span className="font-medium">Location:</span> {person.location}</p>
                  )}
                  
                  {person.bio && (
                    <p className="text-gray-600 mt-3">{person.bio}</p>
                  )}
                </div>
                
                <div className="mt-4 flex space-x-2">
                  <a
                    href={`mailto:${person.email}`}
                    className="bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700 transition duration-200"
                  >
                    Email
                  </a>
                  
                  {person.linkedinUrl && (
                    <a
                      href={person.linkedinUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="bg-blue-800 text-white px-3 py-1 rounded text-sm hover:bg-blue-900 transition duration-200"
                    >
                      LinkedIn
                    </a>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
      
      <div className="mt-8 text-center text-gray-600">
        Showing {filteredAlumni.length} of {alumni.length} alumni
      </div>
    </div>
  )
}