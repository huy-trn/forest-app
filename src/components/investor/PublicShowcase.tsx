import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { useTranslation } from 'react-i18next';
import { Badge } from '../ui/badge';
import { TreeDeciduous, MapPin, TrendingUp, Award, Users, Calendar } from 'lucide-react';
import { ImageWithFallback } from '../figma/ImageWithFallback';

export function PublicShowcase() {
  const { t } = useTranslation();
  return (
    <div className="space-y-6">
      {/* Hero Section */}
      <Card className="bg-gradient-to-br from-green-600 to-emerald-700 text-white">
        <CardContent className="pt-6 pb-8">
          <div className="max-w-3xl mx-auto text-center space-y-4">
            <h1 className="text-white">{t('investor.showcase.heroTitle')}</h1>
            <p className="text-lg text-green-50">
              {t('investor.showcase.heroDesc')}
            </p>
            <div className="flex justify-center gap-8 pt-4">
              <div className="text-center">
                <p className="text-3xl mb-1">23</p>
                <p className="text-sm text-green-100">{t('investor.showcase.projects')}</p>
              </div>
              <div className="text-center">
                <p className="text-3xl mb-1">1,245 ha</p>
                <p className="text-sm text-green-100">{t('investor.showcase.area')}</p>
              </div>
              <div className="text-center">
                <p className="text-3xl mb-1">156K</p>
                <p className="text-sm text-green-100">{t('investor.showcase.trees')}</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Key Features */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-3">
              <TreeDeciduous className="w-6 h-6 text-green-600" />
            </div>
            <CardTitle className="text-lg">{t('investor.showcase.feature1Title')}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600">
              {t('investor.showcase.feature1Desc')}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-3">
              <Users className="w-6 h-6 text-blue-600" />
            </div>
            <CardTitle className="text-lg">{t('investor.showcase.feature2Title')}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600">
              {t('investor.showcase.feature2Desc')}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center mb-3">
              <Award className="w-6 h-6 text-yellow-600" />
            </div>
            <CardTitle className="text-lg">{t('investor.showcase.feature3Title')}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600">
              {t('investor.showcase.feature3Desc')}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Featured Projects */}
      <Card>
        <CardHeader>
          <CardTitle>{t('investor.showcase.featuredTitle')}</CardTitle>
          <CardDescription>{t('investor.showcase.featuredDesc')}</CardDescription>
        </CardHeader>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="overflow-hidden">
          <div className="h-48 bg-gradient-to-br from-green-400 to-emerald-600 flex items-center justify-center">
            <ImageWithFallback 
              src="https://images.unsplash.com/photo-1637983927499-12b9d4f90585?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwaW5lJTIwZm9yZXN0JTIwbGFuZHNjYXBlfGVufDF8fHx8MTc2MzI5NzIwNXww&ixlib=rb-4.1.0&q=80&w=1080"
              alt="Dự án Rừng Thông"
              className="w-full h-full object-cover"
            />
          </div>
          <CardContent className="pt-6">
            <div className="flex items-start justify-between mb-3">
              <h3>{t('investor.showcase.project1')}</h3>
              <Badge>{t('investor.showcase.active')}</Badge>
            </div>
            <p className="text-sm text-gray-600 mb-4">
              {t('investor.showcase.project1Desc')}
            </p>
            <div className="space-y-2 text-sm">
              <div className="flex items-center gap-2 text-gray-600">
                <MapPin className="w-4 h-4" />
                {t('investor.showcase.project1Location')}
              </div>
              <div className="flex items-center gap-2 text-gray-600">
                <TreeDeciduous className="w-4 h-4" />
                {t('investor.showcase.project1Trees')}
              </div>
              <div className="flex items-center gap-2 text-gray-600">
                <TrendingUp className="w-4 h-4" />
                {t('investor.showcase.progress')}: 65%
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="overflow-hidden">
          <div className="h-48 bg-gradient-to-br from-amber-400 to-orange-600 flex items-center justify-center">
            <ImageWithFallback 
              src="https://images.unsplash.com/photo-1709650346892-feb83da4265f?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxvYWslMjB0cmVlJTIwZm9yZXN0fGVufDF8fHx8MTc2MzI5NzIwNXww&ixlib=rb-4.1.0&q=80&w=1080"
              alt="Phục hồi rừng Sồi"
              className="w-full h-full object-cover"
            />
          </div>
          <CardContent className="pt-6">
            <div className="flex items-start justify-between mb-3">
              <h3>{t('investor.showcase.project2')}</h3>
              <Badge>{t('investor.showcase.active')}</Badge>
            </div>
            <p className="text-sm text-gray-600 mb-4">
              {t('investor.showcase.project2Desc')}
            </p>
            <div className="space-y-2 text-sm">
              <div className="flex items-center gap-2 text-gray-600">
                <MapPin className="w-4 h-4" />
                {t('investor.showcase.project2Location')}
              </div>
              <div className="flex items-center gap-2 text-gray-600">
                <TreeDeciduous className="w-4 h-4" />
                {t('investor.showcase.project2Trees')}
              </div>
              <div className="flex items-center gap-2 text-gray-600">
                <TrendingUp className="w-4 h-4" />
                {t('investor.showcase.progress')}: 45%
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Impact Statistics */}
      <Card>
        <CardHeader>
          <CardTitle>{t('investor.showcase.impactTitle')}</CardTitle>
          <CardDescription>{t('investor.showcase.impactDesc')}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <TreeDeciduous className="w-8 h-8 text-green-600" />
              </div>
              <p className="text-2xl mb-1">156,000</p>
              <p className="text-sm text-gray-600">{t('investor.showcase.impactTrees')}</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <MapPin className="w-8 h-8 text-blue-600" />
              </div>
              <p className="text-2xl mb-1">1,245</p>
              <p className="text-sm text-gray-600">{t('investor.showcase.impactArea')}</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <Users className="w-8 h-8 text-yellow-600" />
              </div>
              <p className="text-2xl mb-1">127</p>
              <p className="text-sm text-gray-600">{t('investor.showcase.impactMembers')}</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <Calendar className="w-8 h-8 text-purple-600" />
              </div>
              <p className="text-2xl mb-1">23</p>
              <p className="text-sm text-gray-600">{t('investor.showcase.impactProjects')}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}