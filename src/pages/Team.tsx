import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Mail, Linkedin } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const Team = () => {
  const leadership = [
    {
      name: "Sarah Mitchell",
      role: "Founder & CEO",
      bio: "With over 15 years in the cleaning industry, Sarah founded Touch Cleaning with a vision to deliver exceptional service across Sydney.",
      expertise: ["Business Strategy", "Client Relations", "Quality Management"],
    },
    {
      name: "James Chen",
      role: "Operations Director",
      bio: "James oversees all operational aspects, ensuring every project meets our high standards of excellence.",
      expertise: ["Operations", "Team Leadership", "Process Optimization"],
    },
    {
      name: "Emma Thompson",
      role: "Head of Commercial Services",
      bio: "Leading our commercial division, Emma has secured contracts with major corporations and government agencies.",
      expertise: ["Commercial Cleaning", "Contract Management", "B2B Relations"],
    },
  ];

  const team = [
    {
      name: "Michael Roberts",
      role: "Senior Cleaning Specialist",
      specialization: "Commercial Projects",
    },
    {
      name: "Lisa Anderson",
      role: "Residential Services Manager",
      specialization: "Luxury Homes",
    },
    {
      name: "David Kim",
      role: "Technical Specialist",
      specialization: "Industrial Cleaning",
    },
    {
      name: "Rachel Martinez",
      role: "Quality Assurance Lead",
      specialization: "Standards & Compliance",
    },
    {
      name: "Tom Wilson",
      role: "Customer Success Manager",
      specialization: "Client Experience",
    },
    {
      name: "Sophie Taylor",
      role: "Training Coordinator",
      specialization: "Staff Development",
    },
  ];

  const values = [
    {
      title: "Excellence",
      description: "We strive for perfection in every cleaning task we undertake.",
    },
    {
      title: "Integrity",
      description: "Trust and transparency guide all our client relationships.",
    },
    {
      title: "Innovation",
      description: "We continuously adopt new technologies and eco-friendly methods.",
    },
    {
      title: "Reliability",
      description: "Consistent, dependable service you can count on every time.",
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <div className="pt-40 pb-20 px-4">
        <div className="container mx-auto">
          {/* Header */}
          <div className="text-center mb-16 max-w-3xl mx-auto">
            <h1 className="text-5xl md:text-6xl font-bold text-foreground mb-6">
              Meet Our Team
            </h1>
            <p className="text-xl text-muted-foreground">
              The dedicated professionals behind Touch Cleaning's success. Our experienced team brings expertise, passion, and commitment to every project.
            </p>
          </div>

          {/* Leadership Team */}
          <div className="mb-20">
            <h2 className="text-3xl font-bold text-foreground mb-8 text-center">
              Leadership Team
            </h2>
            <div className="grid md:grid-cols-3 gap-8">
              {leadership.map((member, index) => (
                <Card key={index} className="border-border hover:shadow-lg transition-all">
                  <div className="aspect-square bg-gradient-to-br from-primary/20 via-accent/10 to-muted flex items-center justify-center">
                    <div className="text-8xl font-bold text-primary/40">
                      {member.name.split(' ').map(n => n[0]).join('')}
                    </div>
                  </div>
                  <CardContent className="pt-6">
                    <h3 className="text-2xl font-bold text-foreground mb-1">
                      {member.name}
                    </h3>
                    <p className="text-primary font-semibold mb-4">{member.role}</p>
                    <p className="text-muted-foreground mb-4">{member.bio}</p>
                    <div className="flex flex-wrap gap-2 mb-4">
                      {member.expertise.map((skill, idx) => (
                        <Badge key={idx} variant="secondary">
                          {skill}
                        </Badge>
                      ))}
                    </div>
                    <div className="flex gap-3">
                      <button className="text-muted-foreground hover:text-primary transition-colors">
                        <Mail className="w-5 h-5" />
                      </button>
                      <button className="text-muted-foreground hover:text-primary transition-colors">
                        <Linkedin className="w-5 h-5" />
                      </button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Core Team */}
          <div className="mb-20">
            <h2 className="text-3xl font-bold text-foreground mb-8 text-center">
              Our Core Team
            </h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {team.map((member, index) => (
                <Card key={index} className="border-border hover:shadow-lg transition-all">
                  <div className="aspect-video bg-gradient-to-br from-primary/10 via-accent/5 to-muted flex items-center justify-center">
                    <div className="text-6xl font-bold text-primary/30">
                      {member.name.split(' ').map(n => n[0]).join('')}
                    </div>
                  </div>
                  <CardContent className="pt-6">
                    <h3 className="text-xl font-bold text-foreground mb-1">
                      {member.name}
                    </h3>
                    <p className="text-primary font-semibold mb-2">{member.role}</p>
                    <p className="text-sm text-muted-foreground">
                      Specializes in {member.specialization}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Values */}
          <div className="mb-20">
            <h2 className="text-3xl font-bold text-foreground mb-8 text-center">
              Our Values
            </h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {values.map((value, index) => (
                <Card key={index} className="border-border text-center">
                  <CardContent className="pt-8">
                    <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                      <div className="text-2xl font-bold text-primary">{index + 1}</div>
                    </div>
                    <h3 className="text-xl font-bold text-foreground mb-2">
                      {value.title}
                    </h3>
                    <p className="text-muted-foreground">{value.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Team Stats */}
          <div className="bg-muted rounded-2xl p-12">
            <div className="grid md:grid-cols-4 gap-8 text-center">
              <div>
                <div className="text-4xl font-bold text-primary mb-2">50+</div>
                <div className="text-muted-foreground">Team Members</div>
              </div>
              <div>
                <div className="text-4xl font-bold text-primary mb-2">15+</div>
                <div className="text-muted-foreground">Years Experience</div>
              </div>
              <div>
                <div className="text-4xl font-bold text-primary mb-2">100%</div>
                <div className="text-muted-foreground">Certified Professionals</div>
              </div>
              <div>
                <div className="text-4xl font-bold text-primary mb-2">24/7</div>
                <div className="text-muted-foreground">Support Team</div>
              </div>
            </div>
          </div>

          {/* Join Team CTA */}
          <div className="mt-20 bg-primary text-primary-foreground rounded-2xl p-12 text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Join Our Growing Team
            </h2>
            <p className="text-lg opacity-90 mb-8 max-w-2xl mx-auto">
              We're always looking for talented, dedicated professionals to join Touch Cleaning. Be part of a team that values excellence and integrity.
            </p>
            <Badge variant="secondary" className="text-lg px-6 py-2">
              Careers Coming Soon
            </Badge>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default Team;
