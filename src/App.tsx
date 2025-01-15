import React, { useState } from 'react';
import { Upload, Play, Download, FileCode, AlertCircle, CheckCircle2, BookOpen, HelpCircle, X } from 'lucide-react';

interface ValidationResult {
  type: 'error' | 'success';
  message: string;
  location?: string;
}
interface SchematronExample {
  name: string;
  description: string;
  rules: string;
  sampleXml: string;
  category: 'general' | 'ihe';
}

const schematronExamples: SchematronExample[] = [
  {
    name: "Required Elements",
    description: "Checks for required title and author elements",
    category: 'general',
    rules: `<?xml version="1.0" encoding="UTF-8"?>
<schema xmlns="http://purl.oclc.org/dsdl/schematron">
  <pattern>
    <rule context="book">
      <assert test="title">Each book must have a title</assert>
      <assert test="author">Each book must have an author</assert>
    </rule>
  </pattern>
</schema>`,
    sampleXml: `<?xml version="1.0" encoding="UTF-8"?>
<book>
  <title>The Great Gatsby</title>
  <author>F. Scott Fitzgerald</author>
</book>`
  },
  {
    name: "CDA Document Validation",
    description: "Validates CDA R2 document structure for IHE PCC",
    category: 'ihe',
    rules: `<?xml version="1.0" encoding="UTF-8"?>
<schema xmlns="http://purl.oclc.org/dsdl/schematron">
  <ns prefix="cda" uri="urn:hl7-org:v3"/>
  <pattern>
    <rule context="/">
      <assert test="cda:ClinicalDocument">Document root must be ClinicalDocument</assert>
    </rule>
    <rule context="cda:ClinicalDocument">
      <assert test="cda:templateId[@root='2.16.840.1.113883.10.20.1']">
        Must contain CCD template identifier
      </assert>
      <assert test="cda:code[@code='34133-9'][@codeSystem='2.16.840.1.113883.6.1']">
        Document type code must be 34133-9 SUMMARIZATION OF EPISODE NOTE
      </assert>
    </rule>
  </pattern>
</schema>`,
    sampleXml: `<?xml version="1.0" encoding="UTF-8"?>
<ClinicalDocument xmlns="urn:hl7-org:v3">
  <templateId root="2.16.840.1.113883.10.20.1"/>
  <code code="34133-9" codeSystem="2.16.840.1.113883.6.1"/>
</ClinicalDocument>`
  },
  {
    name: "XDS Metadata Validation",
    description: "Validates XDS metadata requirements",
    category: 'ihe',
    rules: `<?xml version="1.0" encoding="UTF-8"?>
<schema xmlns="http://purl.oclc.org/dsdl/schematron">
  <ns prefix="rim" uri="urn:oasis:names:tc:ebxml-regrep:xsd:rim:3.0"/>
  <pattern>
    <rule context="rim:ExtrinsicObject[@objectType='urn:uuid:7edca82f-054d-47f2-a032-9b2a5b5186c1']">
      <assert test="rim:Classification[@classificationScheme='urn:uuid:41a5887f-8865-4c09-adf7-e362475b143a']">
        Must contain classCode classification
      </assert>
      <assert test="rim:ExternalIdentifier[@identificationScheme='urn:uuid:58a6f841-87b3-4a3e-92fd-a8ffeff98427']">
        Must contain patientId identifier
      </assert>
    </rule>
  </pattern>
</schema>`,
    sampleXml: `<?xml version="1.0" encoding="UTF-8"?>
<rim:ExtrinsicObject xmlns:rim="urn:oasis:names:tc:ebxml-regrep:xsd:rim:3.0"
    objectType="urn:uuid:7edca82f-054d-47f2-a032-9b2a5b5186c1">
  <rim:Classification
    classificationScheme="urn:uuid:41a5887f-8865-4c09-adf7-e362475b143a"
    nodeRepresentation="DEMO"/>
  <rim:ExternalIdentifier
    identificationScheme="urn:uuid:58a6f841-87b3-4a3e-92fd-a8ffeff98427"
    value="12345^^^&amp;1.3.6.1.4.1.21367.2005.3.7&amp;ISO"/>
</rim:ExtrinsicObject>`
  },
  {
    name: "DICOM SR Validation",
    description: "Validates DICOM SR document constraints",
    category: 'ihe',
    rules: `<?xml version="1.0" encoding="UTF-8"?>
<schema xmlns="http://purl.oclc.org/dsdl/schematron">
  <ns prefix="sr" uri="urn:dicom:sr"/>
  <pattern>
    <rule context="sr:DicomStructuredReport">
      <assert test="sr:ContentSequence">Must contain Content Sequence</assert>
      <assert test="sr:ConceptNameCodeSequence">Must contain Concept Name Code Sequence</assert>
    </rule>
    <rule context="sr:ContentSequence">
      <assert test="sr:RelationshipType">Each content item must have a relationship type</assert>
      <assert test="sr:ValueType">Each content item must have a value type</assert>
    </rule>
  </pattern>
</schema>`,
    sampleXml: `<?xml version="1.0" encoding="UTF-8"?>
<sr:DicomStructuredReport xmlns:sr="urn:dicom:sr">
  <sr:ContentSequence>
    <sr:RelationshipType>CONTAINS</sr:RelationshipType>
    <sr:ValueType>TEXT</sr:ValueType>
  </sr:ContentSequence>
  <sr:ConceptNameCodeSequence>
    <sr:CodeValue>11528-7</sr:CodeValue>
    <sr:CodingSchemeDesignator>LN</sr:CodingSchemeDesignator>
  </sr:ConceptNameCodeSequence>
</sr:DicomStructuredReport>`
  },
  {
    name: "PIX Query Validation",
    description: "Validates PIX Query message structure",
    category: 'ihe',
    rules: `<?xml version="1.0" encoding="UTF-8"?>
<schema xmlns="http://purl.oclc.org/dsdl/schematron">
  <ns prefix="hl7" uri="urn:hl7-org:v2xml"/>
  <pattern>
    <rule context="hl7:QBP_Q23">
      <assert test="hl7:MSH">Must contain Message Header segment</assert>
      <assert test="hl7:QPD">Must contain Query Parameter Definition segment</assert>
    </rule>
    <rule context="hl7:QPD">
      <assert test="hl7:QPD.1/text()='IHE PIX Query'">
        QPD-1 Message Query Name must be 'IHE PIX Query'
      </assert>
      <assert test="hl7:QPD.3">Must contain QPD-3 Patient Identifier</assert>
    </rule>
  </pattern>
</schema>`,
    sampleXml: `<?xml version="1.0" encoding="UTF-8"?>
<hl7:QBP_Q23 xmlns:hl7="urn:hl7-org:v2xml">
  <hl7:MSH>
    <hl7:MSH.1>|</hl7:MSH.1>
  </hl7:MSH>
  <hl7:QPD>
    <hl7:QPD.1>IHE PIX Query</hl7:QPD.1>
    <hl7:QPD.3>
      <hl7:CX.1>12345</hl7:CX.1>
      <hl7:CX.4>
        <hl7:HD.1>Hospital A</hl7:HD.1>
      </hl7:CX.4>
    </hl7:QPD.3>
  </hl7:QPD>
</hl7:QBP_Q23>`
  }
];

function App() {
  const [schematronRules, setSchematronRules] = useState('');
  const [xmlContent, setXmlContent] = useState('');
  const [results, setResults] = useState<ValidationResult[]>([]);
  const [activeTab, setActiveTab] = useState<'rules' | 'xml'>('rules');
  const [selectedExample, setSelectedExample] = useState<SchematronExample | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<'all' | 'general' | 'ihe'>('all');
  const [showHelp, setShowHelp] = useState(false);

  const handleExampleSelect = (example: SchematronExample) => {
    setSchematronRules(example.rules);
    setXmlContent(example.sampleXml);
    setSelectedExample(example);
    setResults([]);
  };

  const filteredExamples = schematronExamples.filter(
    example => selectedCategory === 'all' || example.category === selectedCategory
  );

  const handleValidate = () => {
    // Simulated validation results
    setResults([
      {
        type: 'error',
        message: 'Required element "title" is missing',
        location: 'Line 15, Column 2'
      },
      {
        type: 'success',
        message: 'Document structure validation passed',
      }
    ]);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <FileCode className="h-8 w-8 text-indigo-600" />
              <h1 className="ml-3 text-2xl font-bold text-gray-900">Schematron Validator</h1>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setShowHelp(true)}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-indigo-700 bg-indigo-100 hover:bg-indigo-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                <HelpCircle className="h-4 w-4 mr-2" />
                Help
              </button>
              <button
                onClick={() => {/* Download functionality */}}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-indigo-700 bg-indigo-100 hover:bg-indigo-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                <Download className="h-4 w-4 mr-2" />
                Export
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center">
              <BookOpen className="h-5 w-5 text-indigo-600 mr-2" />
              <h2 className="text-lg font-medium text-gray-900">Example Rules</h2>
            </div>
            <div className="flex space-x-2">
              <button
                onClick={() => setSelectedCategory('all')}
                className={`px-4 py-2 rounded-md text-sm font-medium ${
                  selectedCategory === 'all'
                    ? 'bg-indigo-600 text-white'
                    : 'bg-white text-gray-700 hover:bg-gray-50'
                }`}
              >
                All
              </button>
              <button
                onClick={() => setSelectedCategory('general')}
                className={`px-4 py-2 rounded-md text-sm font-medium ${
                  selectedCategory === 'general'
                    ? 'bg-indigo-600 text-white'
                    : 'bg-white text-gray-700 hover:bg-gray-50'
                }`}
              >
                General
              </button>
              <button
                onClick={() => setSelectedCategory('ihe')}
                className={`px-4 py-2 rounded-md text-sm font-medium ${
                  selectedCategory === 'ihe'
                    ? 'bg-indigo-600 text-white'
                    : 'bg-white text-gray-700 hover:bg-gray-50'
                }`}
              >
                IHE Profiles
              </button>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {filteredExamples.map((example) => (
              <button
                key={example.name}
                onClick={() => handleExampleSelect(example)}
                className={`p-4 rounded-lg border text-left transition-colors ${
                  selectedExample?.name === example.name
                    ? 'border-indigo-500 bg-indigo-50'
                    : 'border-gray-200 hover:border-indigo-300 hover:bg-gray-50'
                }`}
              >
                <h3 className="font-medium text-gray-900">{example.name}</h3>
                <p className="mt-1 text-sm text-gray-500">{example.description}</p>
              </button>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-xl overflow-hidden">
          <div className="border-b border-gray-200">
            <div className="flex">
              <button
                onClick={() => setActiveTab('rules')}
                className={`px-6 py-3 text-sm font-medium ${
                  activeTab === 'rules'
                    ? 'border-b-2 border-indigo-500 text-indigo-600'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                Schematron Rules
              </button>
              <button
                onClick={() => setActiveTab('xml')}
                className={`px-6 py-3 text-sm font-medium ${
                  activeTab === 'xml'
                    ? 'border-b-2 border-indigo-500 text-indigo-600'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                XML Document
              </button>
            </div>
          </div>

          <div className="p-6">
            {activeTab === 'rules' ? (
              <textarea
                value={schematronRules}
                onChange={(e) => setSchematronRules(e.target.value)}
                className="w-full h-96 font-mono text-sm p-4 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="Paste your Schematron rules here..."
              />
            ) : (
              <textarea
                value={xmlContent}
                onChange={(e) => setXmlContent(e.target.value)}
                className="w-full h-96 font-mono text-sm p-4 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="Paste your XML document here..."
              />
            )}

            <div className="mt-4 flex justify-end">
              <button
                onClick={handleValidate}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                <Play className="h-4 w-4 mr-2" />
                Validate
              </button>
            </div>
          </div>

          {results.length > 0 && (
            <div className="border-t border-gray-200 p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Validation Results</h3>
              <div className="space-y-4">
                {results.map((result, index) => (
                  <div
                    key={index}
                    className={`flex items-start p-4 rounded-lg ${
                      result.type === 'error'
                        ? 'bg-red-50'
                        : 'bg-green-50'
                    }`}
                  >
                    {result.type === 'error' ? (
                      <AlertCircle className="h-5 w-5 text-red-400 mt-0.5" />
                    ) : (
                      <CheckCircle2 className="h-5 w-5 text-green-400 mt-0.5" />
                    )}
                    <div className="ml-3">
                      <p className={`text-sm font-medium ${
                        result.type === 'error' ? 'text-red-800' : 'text-green-800'
                      }`}>
                        {result.message}
                      </p>
                      {result.location && (
                        <p className="mt-1 text-sm text-gray-500">{result.location}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Help Modal */}
      {showHelp && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full mx-4 p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-gray-900">Help & Resources</h2>
              <button
                onClick={() => setShowHelp(false)}
                className="text-gray-400 hover:text-gray-500"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
            
            <div className="prose max-w-none">
              <h3 className="text-lg font-semibold mb-2">Video Tutorials</h3>
              <ul className="space-y-2 mb-6">
                <li>
                  <a
                    href="https://youtu.be/OUNvPS9qZ-M?si=U_wFN-DShSx78bHv"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-indigo-600 hover:text-indigo-800"
                  >
                    Session 1: Introduction to Schematron Validation
                  </a>
                </li>
                <li>
                  <a
                    href="https://www.youtube.com/watch?si=HHxCpg-BCFX23Bwt&v=j1yYRNgBiXA"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-indigo-600 hover:text-indigo-800"
                  >
                    Session 2: Advanced Schematron Techniques
                  </a>
                </li>
              </ul>

              <h3 className="text-lg font-semibold mb-2">Documentation</h3>
              <ul className="space-y-2">
                <li>
                  <a
                    href="https://gazelle.ihe.net/gazelle-documentation/Schematron-Validator/user.html"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-indigo-600 hover:text-indigo-800"
                  >
                    Schematron Validator Documentation
                  </a>
                </li>
              </ul>

              <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                <h4 className="font-semibold mb-2">Quick Start</h4>
                <ol className="list-decimal list-inside space-y-2">
                  <li>Select an example from the provided templates or paste your own Schematron rules</li>
                  <li>Switch to the XML tab and enter your XML document</li>
                  <li>Click the Validate button to check your XML against the Schematron rules</li>
                  <li>Review the validation results below</li>
                </ol>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
