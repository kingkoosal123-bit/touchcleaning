import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Mail, Linkedin } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { supabase } from "@/integrations/supabase/client";

interface TeamMember {
  id: string;
  name: string;
  role: string;
  bio: string | null;
  image_url: string | null;
  email: string | null;
  linkedin_url: string | null;
  expertise: string[] | null;
  is_leadership: boolean | null;
}

const Team = () => {
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTeamMembers = async () => {
      const { data, error } = await supabase
        .from("cms_team_members")
        .select("*")
        .eq("is_active", true)
        .order("display_order", { ascending: true });

      if (!error && data) {
        setTeamMembers(data);
      }
      setLoading(false);
    };

    fetchTeamMembers();
  }, []);

  const leadership = teamMembers.filter(member => member.is_leadership);
  const coreTeam = teamMembers.filter(member => !member.is_leadership);

  // Fallback data if CMS is empty
  const fallbackLeadership: TeamMember[] = [
    {
      id: "1",
      name: "Sarah Mitchell",
      role: "Founder & CEO",
      bio: "With over 15 years in the cleaning industry, Sarah founded Touch Cleaning with a vision to deliver exceptional service across Sydney.",
      expertise: ["Business Strategy", "Client Relations", "Quality Management"],
      image_url: null,
      email: null,
      linkedin_url: null,
      is_leadership: true,
    },
    {
      id: "2",
      name: "James Chen",
      role: "Operations Director",
      bio: "James oversees all operational aspects, ensuring every project meets our high standards of excellence.",
      expertise: ["Operations", "Team Leadership", "Process Optimization"],
      image_url: null,
      email: null,
      linkedin_url: null,
      is_leadership: true,
    },
  ];

  const fallbackTeam: TeamMember[] = [
    {
      id: "3",
      name: "Michael Roberts",
      role: "Senior Cleaning Specialist",
      bio: "Specializes in Commercial Projects",
      expertise: null,
      image_url: null,
      email: null,
      linkedin_url: null,
      is_leadership: false,
    },
    {
      id: "4",
      name: "Lisa Anderson",
      role: "Residential Services Manager",
      bio: "Specializes in Luxury Homes",
      expertise: null,
      image_url: null,
      email: null,
      linkedin_url: null,
      is_leadership: false,
    },
  ];

  const displayLeadership = leadership.length > 0 ? leadership : fallbackLeadership;
  const displayTeam = coreTeam.length > 0 ? coreTeam : fallbackTeam;

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
            {loading ? (
              <div className="grid md:grid-cols-3 gap-8">
                {Array(3).fill(0).map((_, index) => (
                  <Card key={index} className="border-border animate-pulse">
                    <div className="aspect-square bg-muted" />
                    <CardContent className="pt-6">
                      <div className="bg-muted h-8 w-3/4 mb-2 rounded" />
                      <div className="bg-muted h-6 w-1/2 mb-4 rounded" />
                      <div className="bg-muted h-20 rounded" />
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="grid md:grid-cols-3 gap-8">
                {displayLeadership.map((member) => (
                  <Card key={member.id} className="border-border hover:shadow-lg transition-all">
                    <div className="aspect-square overflow-hidden">
                      {member.image_url ? (
                        <img 
                          src={member.image_url} 
                          alt={member.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-primary/20 via-accent/10 to-muted flex items-center justify-center">
                          <div className="text-8xl font-bold text-primary/40">
                            {member.name.split(' ').map(n => n[0]).join('')}
                          </div>
                        </div>
                      )}
                    </div>
                    <CardContent className="pt-6">
                      <h3 className="text-2xl font-bold text-foreground mb-1">
                        {member.name}
                      </h3>
                      <p className="text-primary font-semibold mb-4">{member.role}</p>
                      {member.bio && (
                        <p className="text-muted-foreground mb-4">{member.bio}</p>
                      )}
                      {member.expertise && member.expertise.length > 0 && (
                        <div className="flex flex-wrap gap-2 mb-4">
                          {member.expertise.map((skill, idx) => (
                            <Badge key={idx} variant="secondary">
                              {skill}
                            </Badge>
                          ))}
                        </div>
                      )}
                      <div className="flex gap-3">
                        {member.email && (
                          <a 
                            href={`mailto:${member.email}`}
                            className="text-muted-foreground hover:text-primary transition-colors"
                          >
                            <Mail className="w-5 h-5" />
                          </a>
                        )}
                        {member.linkedin_url && (
                          <a 
                            href={member.linkedin_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-muted-foreground hover:text-primary transition-colors"
                          >
                            <Linkedin className="w-5 h-5" />
                          </a>
                        )}
                        {!member.email && !member.linkedin_url && (
                          <>
                            <button className="text-muted-foreground hover:text-primary transition-colors">
                              <Mail className="w-5 h-5" />
                            </button>
                            <button className="text-muted-foreground hover:text-primary transition-colors">
                              <Linkedin className="w-5 h-5" />
                            </button>
                          </>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
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
